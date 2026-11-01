'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/cart-context';
import { usePaymentProviders } from '@/hooks/use-payment-providers';
import { useCheckoutQuestions } from '@/hooks/use-checkout-questions';
import { rememberCheckout } from '@/lib/checkout-outcome';
import type {
	CustomerProviderCatalogItem,
	CheckoutCustomer,
	CheckoutStartResponse,
	CheckoutResponse,
	StartCheckout,
	SubmitCheckout,
	CartItem,
	CheckoutQuestionResponse as CheckoutQuestion,
} from '@opencals/storefront-sdk';

export type CheckoutStep = 'customer' | 'questions' | 'payment-select' | 'payment';

/** A payment method's provider name. */
type ProviderName = CustomerProviderCatalogItem['name'];

// The backend can override the requested provider with the "no payment required" fallback when nothing
// is collectible.
function isNoPaymentRequired(provider: CheckoutStartResponse['provider']): boolean {
	return provider === 'no_payment_required';
}

/** The API names checkout conflicts with a `code`; it picks the wording, the salon's voice writes it. */
const CONFLICT_COPY: Record<string, string> = {
	CART_EXPIRED: 'Your hold lapsed and that time has since been taken. Choose another time and we’ll hold it for you.',
	PAYMENT_NOT_AUTHORIZED: 'Your card wasn’t authorised, so nothing was booked or charged. Try again, or use another card.',
	CHECKOUT_IN_PROGRESS: 'We’re still finishing your booking. Give it a moment and try again.',
};
/** CHECKOUT_IN_PROGRESS means a twin request (double click, second tab) is still running: wait, then retry. */
const BUSY_RETRIES = 4;
const BUSY_PAUSE_MS = 1500;

class CheckoutConflict extends Error {
	constructor(
		message: string,
		readonly code?: string,
		readonly orderId?: string,
	) {
		super(message);
	}
}

async function failureOf(res: Response, fallback: string): Promise<CheckoutConflict> {
	try {
		const data = (await res.json()) as { error?: string; code?: string; orderId?: string };
		return new CheckoutConflict((data.code && CONFLICT_COPY[data.code]) || data.error || fallback, data.code, data.orderId);
	} catch {
		return new CheckoutConflict(fallback);
	}
}

interface CheckoutContextValue {
	// State
	step: CheckoutStep;
	error: string | null;
	submitting: boolean;
	checkoutComplete: boolean;
	/** The held time was taken while the hold had lapsed (CART_EXPIRED): pick a new one. */
	holdLost: boolean;

	// Customer
	email: string;
	firstName: string;
	lastName: string;
	customerId: string | null;
	setEmail: (v: string) => void;
	setFirstName: (v: string) => void;
	setLastName: (v: string) => void;

	// Questions
	questions: CheckoutQuestion[];
	answers: Record<string, string>;
	setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;

	// Payment
	providers: CustomerProviderCatalogItem[];
	selectedProvider: ProviderName | null;
	paymentData: CheckoutStartResponse | null;

	// Cart info
	items: CartItem[];
	isExpired: boolean;
	timeRemaining: number | null;
	minutes: number | null;
	seconds: number | null;

	// Actions
	setStep: (step: CheckoutStep) => void;
	setError: (error: string | null) => void;
	handleSaveCustomer: (e: React.FormEvent) => Promise<void>;
	handleSaveAnswers: (e: React.FormEvent) => Promise<void>;
	handleStartCheckout: (providerName: ProviderName) => Promise<void>;
	handleSubmitCheckout: (stripePaymentIntentId?: string) => Promise<void>;
	extendCart: () => void;
	/** Drops the card and returns to The Menu to choose a new time. */
	startOver: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { data: session } = useSession();
	const { cart, cartId, isLoaded, timeRemaining, extendCart, clearCart } = useCart();

	const [step, setStep] = useState<CheckoutStep>('customer');
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [checkoutComplete, setCheckoutComplete] = useState(false);
	const [holdLost, setHoldLost] = useState(false);

	// Customer info
	const [email, setEmail] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [customerId, setCustomerId] = useState<string | null>(null);
	const [prefilled, setPrefilled] = useState(false);

	// Pre-fill from session
	useEffect(() => {
		if (session?.customer && !prefilled) {
			if (session.customer.id) setCustomerId(session.customer.id);
			if (session.customer.email) setEmail(session.customer.email);
			if (session.customer.firstName) setFirstName(session.customer.firstName);
			if (session.customer.lastName) setLastName(session.customer.lastName);
			setPrefilled(true);
		}
	}, [session, prefilled]);

	// Questions (cart-scoped) and payment providers (cart-aware) both load in
	// parallel via SWR — independent of the customer-save step, so there's no
	// sequential fetch waterfall. `answers` stays local to this step machine.
	const questions = useCheckoutQuestions(cartId);
	const providers = usePaymentProviders(cartId);
	const [answers, setAnswers] = useState<Record<string, string>>({});

	// Payment
	const [selectedProvider, setSelectedProvider] = useState<ProviderName | null>(null);
	const [paymentData, setPaymentData] = useState<CheckoutStartResponse | null>(null);
	// Read by submit within the same call as start, where state would still be stale.
	const providerRef = useRef<ProviderName | null>(null);

	// Redirect if no cart — but only once CartProvider has read the stored cart id
	// from localStorage. Before that cartId is always null, so a hard reload of
	// /checkout would otherwise bounce to /services.
	useEffect(() => {
		if (isLoaded && !cartId && !checkoutComplete) {
			router.replace('/services');
		}
	}, [isLoaded, cartId, checkoutComplete, router]);

	const cartHeaders = useCallback(
		(): Record<string, string> =>
			cartId
				? { 'X-Cart-Id': cartId, 'Content-Type': 'application/json' }
				: { 'Content-Type': 'application/json' },
		[cartId],
	);

	// Step 1: Save customer info
	const handleSaveCustomer = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError(null);
			setSubmitting(true);

			try {
				const customerPayload: CheckoutCustomer = customerId
					? { customer: { kind: 'existing', customerId } }
					: { customer: { kind: 'new', email, firstName: firstName || undefined, lastName: lastName || undefined } };

				const res = await fetch('/api/checkout/save-customer', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify(customerPayload),
				});

				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.error || 'Failed to save customer info');
				}

				const saveResult = await res.json();
				if (saveResult.customerId) {
					setCustomerId(saveResult.customerId);
				}

				// Questions are already loaded in parallel via SWR — just branch on them
				// (no sequential fetch here).
				setStep(questions.length > 0 ? 'questions' : 'payment-select');
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setSubmitting(false);
			}
		},
		[email, firstName, lastName, customerId, cartHeaders, questions.length],
	);

	// Step 2: Save question answers
	const handleSaveAnswers = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError(null);
			setSubmitting(true);

			try {
				const answerArray = Object.entries(answers).map(([questionId, value]) => ({
					questionId,
					value,
				}));

				const res = await fetch('/api/checkout/save-answers', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify({ answers: answerArray }),
				});

				if (!res.ok && res.status !== 204) {
					throw new Error('Failed to save answers');
				}

				setStep('payment-select');
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setSubmitting(false);
			}
		},
		[answers, cartHeaders],
	);

	/** POSTs a checkout call; waits out CHECKOUT_IN_PROGRESS, throws a CheckoutConflict on anything else. */
	const post = useCallback(
		async <T,>(url: string, body: unknown, fallback: string): Promise<T> => {
			for (let attempt = 0; ; attempt++) {
				const res = await fetch(url, { method: 'POST', headers: cartHeaders(), body: JSON.stringify(body) });
				if (res.ok) return (await res.json()) as T;
				const failure = await failureOf(res, fallback);
				if (failure.code !== 'CHECKOUT_IN_PROGRESS' || attempt >= BUSY_RETRIES) throw failure;
				await new Promise((r) => setTimeout(r, BUSY_PAUSE_MS));
			}
		},
		[cartHeaders],
	);

	// Every failure path lands here, so the spinner and the back link are never left disabled.
	const fail = useCallback((err: unknown) => {
		if (err instanceof CheckoutConflict && err.code === 'CART_EXPIRED') setHoldLost(true);
		setError(err instanceof Error ? err.message : 'An error occurred');
		setSubmitting(false);
	}, []);

	const goToThankYou = useCallback(
		(orderId: string) => {
			setCheckoutComplete(true);
			clearCart();
			router.push(`/thank-you?orderId=${orderId}`);
		},
		[clearCart, router],
	);

	const placeOrder = useCallback(
		async (stripePaymentIntentId?: string) => {
			const submitPayload: SubmitCheckout = {};
			if (stripePaymentIntentId) submitPayload.stripePaymentIntentId = stripePaymentIntentId;
			const data = await post<CheckoutResponse>('/api/checkout/submit', submitPayload, 'Checkout failed');

			// Auto-authenticate customer if tokens returned
			if (data.auth?.accessToken) {
				await nextAuthSignIn('checkout-token', {
					accessToken: data.auth.accessToken,
					refreshToken: data.auth.refreshToken,
					redirect: false,
				});
			}
			rememberCheckout(data, providerRef.current);
			goToThankYou(data.order?.id ?? '');
		},
		[post, goToThankYou],
	);

	// Step 4: Submit checkout (after the card is confirmed, or straight after start for every other method)
	const handleSubmitCheckout = useCallback(
		async (stripePaymentIntentId?: string) => {
			setError(null);
			setSubmitting(true);
			try {
				await placeOrder(stripePaymentIntentId);
			} catch (err: unknown) {
				fail(err);
			}
		},
		[placeOrder, fail],
	);

	// Step 3: Start checkout with the selected provider, then route on how it collects payment
	const handleStartCheckout = useCallback(
		async (providerName: ProviderName) => {
			setError(null);
			setSubmitting(true);
			setSelectedProvider(providerName);
			providerRef.current = providerName;

			try {
				const startPayload: StartCheckout = { provider: providerName };
				if (customerId) {
					startPayload.customer = { kind: 'existing', customerId };
				}

				let data: CheckoutStartResponse;
				try {
					data = await post<CheckoutStartResponse>('/api/checkout/start', startPayload, 'Failed to start checkout');
				} catch (err) {
					if (!(err instanceof CheckoutConflict) || err.code !== 'CART_ALREADY_CHECKED_OUT') throw err;
					// This card is already an order (second tab, lost response): submit answers with that order.
					try {
						await placeOrder();
					} catch {
						if (!err.orderId) throw err;
						goToThankYou(err.orderId);
					}
					return;
				}
				setPaymentData(data);

				// `checkoutMode` decides: `internal` mounts the card form, `redirect` hands over to the provider,
				// `manual` (pay at the salon, bank transfer, invoice) and `none` place the order now. The backend
				// may also swap in "no payment required" when nothing is collectible.
				const mode = providers.find((p) => p.name === providerName)?.checkoutMode;
				if (isNoPaymentRequired(data.provider) || mode === 'manual' || mode === 'none') {
					await placeOrder();
				} else if (data.redirectUrl) {
					window.location.href = data.redirectUrl;
				} else if (data.clientSecret) {
					setStep('payment');
					setSubmitting(false);
				} else if (!mode) {
					// A method this site doesn't know, with nothing to mount: place it like a manual one.
					await placeOrder();
				} else {
					throw new CheckoutConflict('Card payment couldn’t start. Please try again or choose another way to pay.');
				}
			} catch (err: unknown) {
				fail(err);
			}
		},
		[customerId, post, providers, placeOrder, goToThankYou, fail],
	);

	const startOver = useCallback(() => {
		setCheckoutComplete(true);
		clearCart();
		router.push('/services');
	}, [clearCart, router]);

	const items = useMemo(() => cart?.items ?? [], [cart?.items]);
	const isExpired = timeRemaining !== null && timeRemaining <= 0;
	const minutes = timeRemaining !== null ? Math.floor(timeRemaining / 60) : null;
	const seconds = timeRemaining !== null ? timeRemaining % 60 : null;

	// Memoized so consumers don't re-render on every provider render from an
	// inline object identity change.
	const value = useMemo<CheckoutContextValue>(
		() => ({
			step,
			error,
			submitting,
			checkoutComplete,
			holdLost,
			email,
			firstName,
			lastName,
			customerId,
			setEmail,
			setFirstName,
			setLastName,
			questions,
			answers,
			setAnswers,
			providers,
			selectedProvider,
			paymentData,
			items,
			isExpired,
			timeRemaining,
			minutes,
			seconds,
			setStep,
			setError,
			handleSaveCustomer,
			handleSaveAnswers,
			handleStartCheckout,
			handleSubmitCheckout,
			extendCart,
			startOver,
		}),
		[
			step,
			error,
			submitting,
			checkoutComplete,
			holdLost,
			email,
			firstName,
			lastName,
			customerId,
			questions,
			answers,
			providers,
			selectedProvider,
			paymentData,
			items,
			isExpired,
			timeRemaining,
			minutes,
			seconds,
			handleSaveCustomer,
			handleSaveAnswers,
			handleStartCheckout,
			handleSubmitCheckout,
			extendCart,
			startOver,
		],
	);

	return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextValue {
	const ctx = useContext(CheckoutContext);
	if (!ctx) {
		throw new Error('useCheckout must be used within CheckoutProvider');
	}
	return ctx;
}

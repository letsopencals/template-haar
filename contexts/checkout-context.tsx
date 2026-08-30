'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/cart-context';
import type {
	CustomerProviderCatalogItem,
	CheckoutStartResponse,
	SubmitCheckout,
	CartItem,
	CheckoutQuestionResponse as CheckoutQuestion,
} from '@opencals/storefront-sdk';

export type CheckoutStep = 'customer' | 'questions' | 'payment-select' | 'payment';

// The backend can override the requested provider with the "no payment required" fallback when nothing
// is collectible. This template's pinned SDK union predates that value, so accept a widened string here
// (no `as` assertion; SDK types stay authoritative) and compare against the known fallback name.
const NO_PAYMENT_REQUIRED_PROVIDER = 'no_payment_required';
function isNoPaymentRequired(provider: string): boolean {
	return provider === NO_PAYMENT_REQUIRED_PROVIDER;
}

interface CheckoutContextValue {
	// State
	step: CheckoutStep;
	error: string | null;
	submitting: boolean;
	checkoutComplete: boolean;

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
	selectedProvider: string | null;
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
	handleStartCheckout: (providerName: string) => Promise<void>;
	handleSubmitCheckout: (stripePaymentIntentId?: string) => Promise<void>;
	extendCart: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { data: session } = useSession();
	const { cart, cartId, timeRemaining, extendCart, clearCart } = useCart();

	const [step, setStep] = useState<CheckoutStep>('customer');
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [checkoutComplete, setCheckoutComplete] = useState(false);

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

	// Questions
	const [questions, setQuestions] = useState<CheckoutQuestion[]>([]);
	const [answers, setAnswers] = useState<Record<string, string>>({});

	// Payment
	const [providers, setProviders] = useState<CustomerProviderCatalogItem[]>([]);
	const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
	const [paymentData, setPaymentData] = useState<CheckoutStartResponse | null>(null);

	// Redirect if no cart
	useEffect(() => {
		if (!cartId && !checkoutComplete) {
			router.replace('/services');
		}
	}, [cartId, checkoutComplete, router]);

	// Fetch payment providers. Cart-aware, so refetch when the cart id is known — a fully
	// discounted / sub-minimum cart comes back as a single `no_payment_required` provider.
	useEffect(() => {
		async function fetchProviders() {
			try {
				const res = await fetch(
					'/api/payment/providers',
					cartId ? { headers: { 'X-Cart-Id': cartId } } : undefined,
				);
				if (res.ok) {
					const data = await res.json();
					setProviders(Array.isArray(data) ? data : []);
				}
			} catch {
				// providers will be empty
			}
		}
		fetchProviders();
	}, [cartId]);

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
				const customerPayload = customerId
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

				// Fetch checkout questions
				const qRes = await fetch('/api/checkout/questions?language=en', { headers: cartHeaders() });
				if (qRes.ok) {
					const qData = await qRes.json();
					const questionList = Array.isArray(qData) ? qData : [];
					setQuestions(questionList);
					setStep(questionList.length > 0 ? 'questions' : 'payment-select');
				} else {
					setStep('payment-select');
				}
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setSubmitting(false);
			}
		},
		[email, firstName, lastName, customerId, cartHeaders],
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

	// Step 3: Start checkout with selected provider
	const handleStartCheckout = useCallback(
		async (providerName: string) => {
			setError(null);
			setSubmitting(true);
			setSelectedProvider(providerName);

			try {
				const startPayload: Record<string, unknown> = { provider: providerName };
				if (customerId) {
					startPayload.customer = { kind: 'existing', customerId };
				}

				const res = await fetch('/api/checkout/start', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify(startPayload),
				});

				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.error || 'Failed to start checkout');
				}

				const data: CheckoutStartResponse = await res.json();
				setPaymentData(data);

				// Key off the RESPONSE provider: when nothing is collectible the backend overrides the
				// requested provider (e.g. Stripe) with "no payment required" — confirm it immediately, like cash.
				if (providerName === 'cash' || isNoPaymentRequired(data.provider)) {
					await handleSubmitCheckout();
				} else if (data.redirectUrl) {
					window.location.href = data.redirectUrl;
				} else {
					setStep('payment');
				}
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'An error occurred');
				setSubmitting(false);
			}
		},
		[cartHeaders, customerId], // eslint-disable-line react-hooks/exhaustive-deps
	);

	// Step 4: Submit checkout
	const handleSubmitCheckout = useCallback(
		async (stripePaymentIntentId?: string) => {
			setError(null);
			setSubmitting(true);

			try {
				const submitPayload: SubmitCheckout = {
					appointmentsSettings: { markAsScheduled: true },
				};

				if (stripePaymentIntentId) {
					submitPayload.stripePaymentIntentId = stripePaymentIntentId;
				}

				const res = await fetch('/api/checkout/submit', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify(submitPayload),
				});

				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.error || 'Checkout failed');
				}

				const data = await res.json();

				// Auto-authenticate customer if tokens returned
				if (data.auth?.accessToken) {
					await nextAuthSignIn('checkout-token', {
						accessToken: data.auth.accessToken,
						refreshToken: data.auth.refreshToken,
						customerId: data.customer?.id ?? '',
						customerEmail: data.customer?.email ?? email,
						customerFirstName: data.customer?.firstName ?? firstName,
						customerLastName: data.customer?.lastName ?? lastName,
						redirect: false,
					});
				}

				setCheckoutComplete(true);
				clearCart();
				router.push(`/thank-you?orderId=${data.order?.id ?? ''}`);
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'An error occurred');
				setSubmitting(false);
			}
		},
		[cartHeaders, email, firstName, lastName, clearCart, router],
	);

	const items = (cart?.items ?? []) as CartItem[];
	const isExpired = timeRemaining !== null && timeRemaining <= 0;
	const minutes = timeRemaining !== null ? Math.floor(timeRemaining / 60) : null;
	const seconds = timeRemaining !== null ? timeRemaining % 60 : null;

	return (
		<CheckoutContext.Provider
			value={{
				step,
				error,
				submitting,
				checkoutComplete,
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
			}}
		>
			{children}
		</CheckoutContext.Provider>
	);
}

export function useCheckout(): CheckoutContextValue {
	const ctx = useContext(CheckoutContext);
	if (!ctx) {
		throw new Error('useCheckout must be used within CheckoutProvider');
	}
	return ctx;
}

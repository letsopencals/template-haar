'use client';

import { useEffect, useRef, useState } from 'react';
import { useCart } from '@/contexts/cart-context';
import { useCheckout, type CheckoutStep } from '@/contexts/checkout-context';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';
import { EmptyCard } from '@/components/cart/empty-card';
import { formatPrice } from '@/lib/format';
import { CheckoutMasthead } from './checkout-masthead';
import { CheckoutSection, type SectionState } from './checkout-section';
import { CustomerStep } from './customer-step';
import { QuestionsStep } from './questions-step';
import { PaymentMethods, methodActionLabel } from './payment-methods';
import { PaymentStep } from './payment-step';
import { OrderStack } from './order-stack';
import { MobileSummary } from './mobile-summary';
import { PayBar, type PrimaryAction } from './pay-bar';
import { DETAILS_FORM_ID, PAYMENT_METHOD_FORM_ID, QUESTIONS_FORM_ID, STRIPE_FORM_ID } from './form-ids';

const SECTION_IDS = { details: 'checkout-step-details', questions: 'checkout-step-questions', payment: 'checkout-step-payment' };

function stepIndex(step: CheckoutStep): number {
	if (step === 'customer') return 0;
	if (step === 'questions') return 1;
	return 2;
}

function sectionState(current: number, mine: number): SectionState {
	if (current === mine) return 'open';
	return current > mine ? 'done' : 'locked';
}

function sectionFor(step: CheckoutStep): string {
	if (step === 'customer') return SECTION_IDS.details;
	if (step === 'questions') return SECTION_IDS.questions;
	return SECTION_IDS.payment;
}

/** /checkout — numbered sections on the left, the card stack on the right. */
export function CheckoutView() {
	const { cart, cartId, isLoaded } = useCart();
	const { checkoutComplete } = useCheckout();

	if (checkoutComplete) {
		return (
			<CheckoutShell>
				<div className="flex min-h-[40vh] flex-col items-center justify-center text-center" role="status">
					<span className="h-px w-16 origin-left animate-pulse bg-accent" aria-hidden />
					<p className="display-sm mt-6 text-charcoal">
						Printing your <em>card</em>…
					</p>
					<p className="mt-2 text-sm text-warm-gray">Taking you to your confirmation.</p>
				</div>
			</CheckoutShell>
		);
	}

	if (!isLoaded || (cartId && !cart)) {
		return (
			<CheckoutShell>
				<CheckoutSkeleton />
			</CheckoutShell>
		);
	}

	if (!cartId || !cart || (cart.items ?? []).length === 0) {
		return (
			<CheckoutShell>
				<EmptyCard className="flex flex-col items-center py-20 text-center" />
			</CheckoutShell>
		);
	}

	return <CheckoutBody />;
}

function CheckoutShell({ children }: { children: React.ReactNode }) {
	return (
		<section className="bg-paper pt-28 pb-24 sm:pt-32 lg:pt-40">
			<div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
				<CheckoutMasthead />
				{children}
			</div>
		</section>
	);
}

function CheckoutBody() {
	const { cart } = useCart();
	const {
		step,
		error,
		submitting,
		email,
		firstName,
		lastName,
		questions,
		answers,
		providers,
		selectedProvider,
		isExpired,
		setStep,
		setError,
		handleSubmitCheckout,
	} = useCheckout();
	const lenis = useSmoothScroll();

	const [chosen, setChosen] = useState<string | undefined>();
	const method = chosen && providers.some((p) => p.name === chosen) ? chosen : providers[0]?.name;
	const [stripeProcessing, setStripeProcessing] = useState(false);

	const hasQuestions = questions.length > 0;
	const current = stepIndex(step);
	const total = formatPrice(cart?.total ?? cart?.subtotal ?? 0, cart?.paymentCurrencyCode);

	// Bring the newly opened section into view and move focus into it, so
	// keyboard users don't land on <body> when the previous form folds away.
	const previousStep = useRef(step);
	useEffect(() => {
		if (previousStep.current === step) return;
		previousStep.current = step;
		const el = document.getElementById(sectionFor(step));
		if (!el) return;
		if (lenis) lenis.scrollTo(el, { offset: -110 });
		else el.scrollIntoView({ block: 'start', behavior: 'smooth' });
		const t = window.setTimeout(() => {
			el.querySelector<HTMLElement>('[data-section-body] :is(input, select, textarea, button)')?.focus({ preventScroll: true });
		}, 450);
		return () => window.clearTimeout(t);
	}, [step, lenis]);

	const fullName = [firstName, lastName].filter(Boolean).join(' ');
	const answered = Object.values(answers).filter((v) => v !== '' && v !== 'false').length;
	const paymentIndex = hasQuestions ? '03' : '02';

	const action = primaryAction({
		step,
		submitting,
		isExpired,
		hasEmail: Boolean(email),
		hasProviders: providers.length > 0,
		method,
		selectedProvider,
		stripeProcessing,
		total,
		onConfirmCash: () => void handleSubmitCheckout(),
	});

	return (
		<section className="bg-paper pt-28 pb-32 sm:pt-32 lg:pt-40 lg:pb-28">
			<div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
				<CheckoutMasthead />

				<div className="mt-6 lg:mt-0 lg:grid lg:grid-cols-12 lg:gap-16 xl:gap-24">
					<div className="lg:col-span-7">
						<MobileSummary />

						{error ? (
							<div role="alert" className="mt-8 flex items-start gap-4 border-l-2 border-red-700 bg-red-50/70 px-5 py-4 text-sm text-red-800">
								<p className="flex-1">{error}</p>
								<button
									type="button"
									onClick={() => setError(null)}
									className="eyebrow shrink-0 text-[0.6rem] text-red-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
								>
									Dismiss
								</button>
							</div>
						) : null}

						<div className="mt-2 lg:mt-10">
							<CheckoutSection
								id={SECTION_IDS.details}
								index="01"
								title="Your details"
								state={sectionState(current, 0)}
								summary={[fullName, email].filter(Boolean).join(' · ')}
								onEdit={submitting ? undefined : () => setStep('customer')}
							>
								<CustomerStep />
							</CheckoutSection>

							{hasQuestions ? (
								<CheckoutSection
									id={SECTION_IDS.questions}
									index="02"
									title="A few questions"
									state={sectionState(current, 1)}
									summary={`${answered} of ${questions.length} answered`}
									lockedHint="So your stylist can prepare."
									onEdit={submitting ? undefined : () => setStep('questions')}
								>
									<QuestionsStep />
								</CheckoutSection>
							) : null}

							<CheckoutSection
								id={SECTION_IDS.payment}
								index={paymentIndex}
								title="Payment"
								state={current === 2 ? 'open' : 'locked'}
								lockedHint="Card, or pay at the salon where offered."
							>
								{step === 'payment' ? (
									<PaymentStep payLabel={total} onProcessingChange={setStripeProcessing} />
								) : (
									<PaymentMethods method={method} onMethodChange={setChosen} />
								)}
							</CheckoutSection>

<div className="border-t border-line" aria-hidden />
						</div>
					</div>

					<aside aria-label="Your appointments" className="hidden lg:col-span-5 lg:block">
						<div className="sticky top-28 pt-10">
							<OrderStack />
						</div>
					</aside>
				</div>
			</div>

			<PayBar total={total} action={action} />
		</section>
	);
}

interface ActionInput {
	step: CheckoutStep;
	submitting: boolean;
	isExpired: boolean;
	hasEmail: boolean;
	hasProviders: boolean;
	method: string | undefined;
	selectedProvider: string | null;
	stripeProcessing: boolean;
	total: string;
	onConfirmCash: () => void;
}

/** What the mobile pay bar does at each step — mirrors the section's own submit button. */
function primaryAction(i: ActionInput): PrimaryAction | null {
	const blocked = i.submitting || i.isExpired;
	switch (i.step) {
		case 'customer':
			return { label: i.submitting ? 'Saving…' : 'Continue', form: DETAILS_FORM_ID, disabled: blocked || !i.hasEmail, busy: i.submitting };
		case 'questions':
			return { label: i.submitting ? 'Saving…' : 'Continue', form: QUESTIONS_FORM_ID, disabled: blocked, busy: i.submitting };
		case 'payment-select':
			if (!i.hasProviders) return null;
			return {
				label: i.submitting ? 'One moment…' : methodActionLabel(i.method),
				form: PAYMENT_METHOD_FORM_ID,
				disabled: blocked || !i.method,
				busy: i.submitting,
			};
		case 'payment':
			if (i.selectedProvider === 'stripe') {
				const busy = i.stripeProcessing || i.submitting;
				return { label: busy ? 'Processing…' : `Pay ${i.total}`, form: STRIPE_FORM_ID, disabled: busy || i.isExpired, busy };
			}
			if (i.selectedProvider === 'cash') {
				return { label: i.submitting ? 'Confirming…' : 'Confirm booking', onClick: i.onConfirmCash, disabled: blocked, busy: i.submitting };
			}
			return null;
	}
}

function CheckoutSkeleton() {
	return (
		<div className="mt-10 grid gap-16 lg:grid-cols-12" aria-busy="true" aria-label="Loading your card">
			<div className="space-y-6 lg:col-span-7">
				<div className="image-placeholder h-8 w-2/3" />
				<div className="image-placeholder h-12" />
				<div className="image-placeholder h-12" />
				<div className="image-placeholder h-8 w-1/2" />
			</div>
			<div className="hidden lg:col-span-5 lg:block">
				<div className="image-placeholder h-64" />
			</div>
		</div>
	);
}

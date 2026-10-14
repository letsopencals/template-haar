'use client';

import dynamic from 'next/dynamic';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';

// StripePayment pulls in Stripe (@stripe/react-stripe-js + stripe-js), which is
// heavy and only needed on the final step — load it on demand.
const StripePayment = dynamic(() => import('@/components/checkout/stripe-payment').then((m) => m.StripePayment), {
	ssr: false,
	loading: () => <StripeSkeleton />,
});

interface PaymentStepProps {
	/** Formatted total for the pay button. */
	payLabel: string;
	onProcessingChange: (processing: boolean) => void;
}

/** 03 — Payment, once a method is started: the Stripe element (or a cash confirm). */
export function PaymentStep({ payLabel, onProcessingChange }: PaymentStepProps) {
	const { selectedProvider, paymentData, submitting, isExpired, setStep, setError, handleSubmitCheckout } = useCheckout();

	if (!paymentData) return null;

	return (
		<div className="space-y-6">
			{selectedProvider === 'stripe' && paymentData.clientSecret ? (
				<StripePayment
					clientSecret={paymentData.clientSecret}
					stripeAccountId={paymentData.stripeAccountId}
					onSuccess={(piId) => handleSubmitCheckout(piId)}
					onError={(msg) => setError(msg)}
					disabled={isExpired || submitting}
					payLabel={payLabel}
					onProcessingChange={onProcessingChange}
				/>
			) : selectedProvider === 'cash' ? (
				<div className="border border-line bg-paper p-6">
					<p className="font-display text-[1.3rem] text-charcoal">Pay at the salon</p>
					<p className="mt-2 text-sm text-warm-gray">We&rsquo;ll hold your chair; settle up at the desk after your visit.</p>
					<Button
						variant="primary"
						size="lg"
						className="mt-6"
						onClick={() => handleSubmitCheckout()}
						disabled={submitting || isExpired}
					>
						{submitting ? 'Confirming…' : 'Confirm booking'}
					</Button>
				</div>
			) : null}

			<button
				type="button"
				onClick={() => setStep('payment-select')}
				disabled={submitting}
				className="link-underline text-xs text-warm-gray hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-40"
			>
				← Choose another way to pay
			</button>
		</div>
	);
}

function StripeSkeleton() {
	return (
		<div className="space-y-4" aria-busy="true" aria-label="Loading secure payment form">
			<div className="flex gap-3">
				<div className="image-placeholder h-16 flex-1" />
				<div className="image-placeholder h-16 flex-1" />
			</div>
			<div className="image-placeholder h-12" />
			<div className="grid grid-cols-2 gap-3">
				<div className="image-placeholder h-12" />
				<div className="image-placeholder h-12" />
			</div>
		</div>
	);
}

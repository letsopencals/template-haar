'use client';

import dynamic from 'next/dynamic';
import { useCheckout } from '@/contexts/checkout-context';

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

/**
 * 03 — Payment, once a card method is started: the Stripe element. Every other method (pay at the salon, bank
 * transfer, invoice, nothing to pay) places the booking straight after start and never reaches this step.
 */
export function PaymentStep({ payLabel, onProcessingChange }: PaymentStepProps) {
	const { paymentData, submitting, isExpired, setStep, setError, handleSubmitCheckout } = useCheckout();

	return (
		<div className="space-y-6">
			{paymentData?.clientSecret ? (
				<StripePayment
					clientSecret={paymentData.clientSecret}
					stripeAccountId={paymentData.stripeAccountId}
					publishableKey={paymentData.publishableKey}
					onSuccess={(piId) => handleSubmitCheckout(piId)}
					onError={(msg) => setError(msg)}
					disabled={isExpired || submitting}
					payLabel={payLabel}
					onProcessingChange={onProcessingChange}
				/>
			) : (
				<p className="text-sm text-warm-gray">The card form isn&rsquo;t ready. Choose another way to pay, or try again.</p>
			)}

			<button
				type="button"
				onClick={() => {
					setError(null);
					setStep('payment-select');
				}}
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

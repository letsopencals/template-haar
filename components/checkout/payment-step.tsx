'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';

// StripePayment pulls in Stripe (@stripe/react-stripe-js + stripe-js), which is
// heavy and only needed on the final step — load it on demand.
const StripePayment = dynamic(
	() => import('@/components/checkout/stripe-payment').then((m) => m.StripePayment),
	{ ssr: false },
);

const STEP_INITIAL = { opacity: 0, x: 20 };
const STEP_ANIMATE = { opacity: 1, x: 0 };
const STEP_EXIT = { opacity: 0, x: -20 };
const STEP_TRANSITION = { duration: 0.3 };

export function PaymentStep() {
	const { selectedProvider, paymentData, submitting, isExpired, setStep, setError, handleSubmitCheckout } =
		useCheckout();

	if (!paymentData) return null;

	return (
		<motion.div
			key="payment"
			initial={STEP_INITIAL}
			animate={STEP_ANIMATE}
			exit={STEP_EXIT}
			transition={STEP_TRANSITION}
			className="space-y-6"
		>
			{selectedProvider === 'stripe' && paymentData.clientSecret ? (
				<StripePayment
					clientSecret={paymentData.clientSecret}
					stripeAccountId={paymentData.stripeAccountId}
					onSuccess={(piId) => handleSubmitCheckout(piId)}
					onError={(msg) => setError(msg)}
					disabled={isExpired}
				/>
			) : selectedProvider === 'cash' ? (
				<div className="border border-charcoal/10 p-6 text-center">
					<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Pay at Venue</h3>
					<p className="mt-4 text-sm text-warm-gray">Your booking is confirmed. Please pay when you arrive.</p>
					<Button variant="primary" size="lg" fullWidth className="mt-6" onClick={() => handleSubmitCheckout()} disabled={submitting || isExpired}>
						{submitting ? 'Confirming...' : 'Confirm Booking'}
					</Button>
				</div>
			) : null}

			<Button type="button" variant="outline" size="lg" fullWidth onClick={() => setStep('payment-select')}>
				Back
			</Button>
		</motion.div>
	);
}

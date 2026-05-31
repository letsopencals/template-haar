'use client';

import { motion } from 'framer-motion';
import { useCheckout } from '@/contexts/checkout-context';
import { StripePayment } from '@/components/checkout/stripe-payment';

export function PaymentStep() {
	const { selectedProvider, paymentData, submitting, isExpired, setStep, setError, handleSubmitCheckout } =
		useCheckout();

	if (!paymentData) return null;

	return (
		<motion.div
			key="payment"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className="space-y-6"
		>
			{selectedProvider === 'stripe' && paymentData.client_secret ? (
				<StripePayment
					clientSecret={paymentData.client_secret}
					stripeAccountId={paymentData.stripeAccountId}
					onSuccess={(piId) => handleSubmitCheckout(piId)}
					onError={(msg) => setError(msg)}
					disabled={isExpired}
				/>
			) : selectedProvider === 'cash' ? (
				<div className="border border-charcoal/10 p-6 text-center">
					<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Pay at Venue</h3>
					<p className="mt-4 text-sm text-warm-gray">Your booking is confirmed. Please pay when you arrive.</p>
					<button
						onClick={() => handleSubmitCheckout()}
						disabled={submitting || isExpired}
						className="mt-6 w-full bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent disabled:opacity-50"
					>
						{submitting ? 'Confirming...' : 'Confirm Booking'}
					</button>
				</div>
			) : null}

			<button
				type="button"
				onClick={() => setStep('payment-select')}
				className="w-full border border-charcoal/10 px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-cream"
			>
				Back
			</button>
		</motion.div>
	);
}

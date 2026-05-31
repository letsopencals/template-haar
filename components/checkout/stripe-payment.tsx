'use client';

import { useMemo, useState } from 'react';
import { type Appearance, type StripeError, loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

interface StripePaymentProps {
	clientSecret: string;
	stripeAccountId?: string | null;
	onSuccess: (paymentIntentId: string) => void;
	onError: (message: string) => void;
	disabled?: boolean;
}

export function StripePayment({ clientSecret, stripeAccountId, onSuccess, onError, disabled }: StripePaymentProps) {
	const stripePromise = useMemo(() => {
		if (!publishableKey) return null;
		return loadStripe(publishableKey, {
			stripeAccount: stripeAccountId ?? undefined,
		});
	}, [stripeAccountId]);

	const appearance = useMemo((): Appearance => ({
		theme: 'flat',
		variables: {
			colorPrimary: '#2c2c2c',
			colorBackground: '#ffffff',
			colorText: '#2c2c2c',
			colorDanger: '#dc2626',
			fontFamily: 'system-ui, -apple-system, sans-serif',
			spacingUnit: '4px',
			borderRadius: '0px',
		},
		rules: {
			'.Input': {
				border: '1px solid rgba(44, 44, 44, 0.1)',
				padding: '12px 16px',
				fontSize: '14px',
				transition: 'border-color 0.2s ease',
			},
			'.Input:focus': {
				border: '1px solid #2c2c2c',
				boxShadow: 'none',
			},
			'.Label': {
				color: '#8a8a8a',
				fontSize: '11px',
				fontWeight: '500',
				textTransform: 'uppercase',
				letterSpacing: '0.05em',
			},
			'.Tab': {
				border: '1px solid rgba(44, 44, 44, 0.1)',
				color: '#8a8a8a',
			},
			'.Tab:hover': {
				color: '#2c2c2c',
			},
			'.Tab--selected': {
				border: '1px solid #2c2c2c',
				color: '#2c2c2c',
			},
		},
	}), []);

	const options = useMemo(() => ({ clientSecret, appearance }), [clientSecret, appearance]);

	if (!publishableKey) {
		return (
			<div className="border border-red-200 bg-red-50 p-6">
				<p className="text-sm text-red-700">
					Stripe is not configured. Set <code className="rounded bg-red-100 px-1 py-0.5 text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in your environment.
				</p>
			</div>
		);
	}

	if (!stripePromise) {
		return null;
	}

	return (
		<Elements stripe={stripePromise} options={options}>
			<StripePaymentForm onSuccess={onSuccess} onError={onError} disabled={disabled} />
		</Elements>
	);
}

function StripePaymentForm({
	onSuccess,
	onError,
	disabled,
}: {
	onSuccess: (paymentIntentId: string) => void;
	onError: (message: string) => void;
	disabled?: boolean;
}) {
	const stripe = useStripe();
	const elements = useElements();
	const [processing, setProcessing] = useState(false);

	const handlePay = async () => {
		if (!stripe || !elements || processing) return;

		setProcessing(true);

		try {
			const { error, paymentIntent } = await stripe.confirmPayment({
				elements,
				redirect: 'if_required',
			});

			if (error) {
				onError((error as StripeError).message ?? 'Payment failed');
				return;
			}

			if (paymentIntent?.id) {
				onSuccess(paymentIntent.id);
			} else {
				onError('Payment confirmation did not return a valid result.');
			}
		} catch (err: unknown) {
			onError(err instanceof Error ? err.message : 'Payment failed');
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className="border border-charcoal/10 p-6">
			<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
				Card Payment
			</h3>
			<div className="mt-5">
				<PaymentElement
					options={{
						layout: 'tabs',
					}}
				/>
			</div>
			<button
				onClick={handlePay}
				disabled={!stripe || !elements || processing || disabled}
				className="mt-6 flex w-full items-center justify-center gap-3 bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent disabled:opacity-50"
			>
				{processing ? (
					<>
						<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
						</svg>
						Processing Payment...
					</>
				) : (
					<>
						Pay &amp; Confirm
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</>
				)}
			</button>
		</div>
	);
}

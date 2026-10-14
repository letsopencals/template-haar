'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { type Appearance, type StripeElementsOptions, type StripeError, loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { STRIPE_FORM_ID } from './form-ids';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

// HAAR palette, squared corners, Inter Tight — the Payment Element should read
// as part of the page, not an embedded widget.
const CHARCOAL = '#1a1a1a';
const ACCENT = '#e8530e';
const WARM_GRAY = '#8a8279';
const LINE = 'rgba(26, 26, 26, 0.15)';

const APPEARANCE: Appearance = {
	theme: 'flat',
	variables: {
		colorPrimary: CHARCOAL,
		colorBackground: '#ffffff',
		colorText: CHARCOAL,
		colorTextSecondary: WARM_GRAY,
		colorTextPlaceholder: '#b5aea6',
		colorDanger: '#b91c1c',
		fontFamily: '"Inter Tight", system-ui, sans-serif',
		fontSizeBase: '15px',
		spacingUnit: '4px',
		borderRadius: '0px',
		focusBoxShadow: '0 0 0 4px rgba(232, 83, 14, 0.08)',
		focusOutline: 'none',
	},
	rules: {
		'.Input': {
			border: `1px solid ${LINE}`,
			padding: '14px 16px',
			boxShadow: 'none',
			transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
		},
		'.Input:hover': { border: '1px solid rgba(26, 26, 26, 0.3)' },
		'.Input:focus': { border: `1px solid ${CHARCOAL}`, boxShadow: '0 0 0 4px rgba(232, 83, 14, 0.08)' },
		'.Label': {
			color: WARM_GRAY,
			fontSize: '10px',
			fontWeight: '600',
			textTransform: 'uppercase',
			letterSpacing: '0.22em',
			marginBottom: '10px',
		},
		'.Tab': { border: `1px solid ${LINE}`, backgroundColor: '#ffffff', color: WARM_GRAY, boxShadow: 'none' },
		'.Tab:hover': { color: CHARCOAL, border: '1px solid rgba(26, 26, 26, 0.3)' },
		'.Tab--selected': { border: `1px solid ${CHARCOAL}`, color: CHARCOAL, boxShadow: `inset 0 -2px 0 ${ACCENT}` },
		'.TabIcon--selected': { fill: ACCENT },
		'.Error': { fontSize: '12px' },
	},
};

const FONTS: StripeElementsOptions['fonts'] = [
	{ cssSrc: 'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&display=swap' },
];

interface StripePaymentProps {
	clientSecret: string;
	stripeAccountId?: string | null;
	onSuccess: (paymentIntentId: string) => void;
	onError: (message: string) => void;
	disabled?: boolean;
	/** Total shown on the pay button. */
	payLabel?: string;
	/** Lets the page's mobile pay bar mirror the processing state. */
	onProcessingChange?: (processing: boolean) => void;
}

export function StripePayment({
	clientSecret,
	stripeAccountId,
	onSuccess,
	onError,
	disabled,
	payLabel,
	onProcessingChange,
}: StripePaymentProps) {
	const stripePromise = useMemo(() => {
		if (!publishableKey) return null;
		return loadStripe(publishableKey, { stripeAccount: stripeAccountId ?? undefined });
	}, [stripeAccountId]);

	const options = useMemo<StripeElementsOptions>(() => ({ clientSecret, appearance: APPEARANCE, fonts: FONTS }), [clientSecret]);

	if (!publishableKey) {
		return (
			<div className="border border-red-200 bg-red-50 p-5" role="alert">
				<p className="text-sm text-red-700">
					Card payments aren&rsquo;t configured. Set{' '}
					<code className="bg-red-100 px-1 py-0.5 text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in your environment.
				</p>
			</div>
		);
	}

	if (!stripePromise) return null;

	return (
		<Elements stripe={stripePromise} options={options}>
			<StripePaymentForm
				onSuccess={onSuccess}
				onError={onError}
				disabled={disabled}
				payLabel={payLabel}
				onProcessingChange={onProcessingChange}
			/>
		</Elements>
	);
}

function StripePaymentForm({
	onSuccess,
	onError,
	disabled,
	payLabel,
	onProcessingChange,
}: Omit<StripePaymentProps, 'clientSecret' | 'stripeAccountId'>) {
	const stripe = useStripe();
	const elements = useElements();
	const [processing, setProcessing] = useState(false);

	useEffect(() => {
		onProcessingChange?.(processing);
	}, [processing, onProcessingChange]);

	const handlePay = async (e: FormEvent) => {
		e.preventDefault();
		if (!stripe || !elements || processing || disabled) return;
		setProcessing(true);
		try {
			const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
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
		<form id={STRIPE_FORM_ID} onSubmit={handlePay} aria-busy={processing}>
			<PaymentElement options={{ layout: 'tabs' }} />
			<Button
				type="submit"
				variant="primary"
				size="lg"
				fullWidth
				className="mt-7 max-lg:hidden"
				disabled={!stripe || !elements || processing || disabled}
			>
				{processing ? 'Processing payment…' : payLabel ? `Pay ${payLabel}` : 'Pay & confirm'}
			</Button>
			<p className="mt-4 flex items-center gap-2 text-xs text-warm-gray">
				<svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden>
					<rect x="3" y="7" width="10" height="7" />
					<path d="M5 7V5a3 3 0 016 0v2" />
				</svg>
				Payments are encrypted and processed by Stripe. We never see your card number.
			</p>
		</form>
	);
}

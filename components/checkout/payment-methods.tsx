'use client';

import type { FormEvent } from 'react';
import { clsx } from 'clsx';
import type { CustomerProviderCatalogItem } from '@opencals/storefront-sdk';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { PAYMENT_METHOD_FORM_ID } from './form-ids';

/** Primary-action label for a chosen provider (used here and by the mobile pay bar). */
export function methodActionLabel(name: string | undefined): string {
	switch (name) {
		case 'stripe':
			return 'Continue to card';
		case 'cash':
			return 'Confirm — pay at the salon';
		case 'bank_transfer':
			return 'Confirm — pay by transfer';
		case 'no_payment_required':
			return 'Confirm booking';
		default:
			return 'Continue';
	}
}

interface PaymentMethodsProps {
	method: string | undefined;
	onMethodChange: (name: string) => void;
}

/**
 * Payment method choice as editorial radio cards. Choosing doesn't start the
 * checkout; submitting does (handleStartCheckout), so the visitor can change
 * their mind before anything is created.
 */
export function PaymentMethods({ method, onMethodChange }: PaymentMethodsProps) {
	const { providers, submitting, isExpired, handleStartCheckout } = useCheckout();

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		if (method && !submitting && !isExpired) void handleStartCheckout(method);
	};

	if (providers.length === 0) {
		return <p className="text-sm text-warm-gray">No payment methods are available right now. Please call the salon to book.</p>;
	}

	return (
		<form id={PAYMENT_METHOD_FORM_ID} onSubmit={onSubmit} className="space-y-7">
			<fieldset>
				<legend className="sr-only">Payment method</legend>
				<div className="space-y-3">
					{providers.map((p, i) => (
						<MethodCard
							key={p.name}
							provider={p}
							index={i}
							checked={method === p.name}
							disabled={submitting || isExpired}
							onSelect={onMethodChange}
						/>
					))}
				</div>
			</fieldset>
			<Button type="submit" variant="primary" size="lg" className="max-lg:hidden" disabled={!method || submitting || isExpired}>
				{submitting ? 'One moment…' : methodActionLabel(method)}
				{submitting ? null : <span aria-hidden>→</span>}
			</Button>
		</form>
	);
}

interface MethodCardProps {
	provider: CustomerProviderCatalogItem;
	index: number;
	checked: boolean;
	disabled: boolean;
	onSelect: (name: string) => void;
}

function MethodCard({ provider, index, checked, disabled, onSelect }: MethodCardProps) {
	const id = `pay-${provider.name}`;
	return (
		<label
			htmlFor={id}
			className={clsx(
				'group relative flex cursor-pointer items-start gap-4 border bg-paper p-5 transition-[border-color,background-color,box-shadow] duration-300 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent',
				checked ? 'border-charcoal shadow-card' : 'border-line hover:border-line-strong',
				disabled && 'cursor-not-allowed opacity-60',
			)}
		>
			<input
				id={id}
				type="radio"
				name="payment-method"
				value={provider.name}
				checked={checked}
				disabled={disabled}
				onChange={() => onSelect(provider.name)}
				className="sr-only"
			/>
			<span
				aria-hidden
				className={clsx(
					'mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors',
					checked ? 'border-accent' : 'border-charcoal/30',
				)}
			>
				<span className={clsx('h-2 w-2 rounded-full bg-accent transition-transform duration-300', checked ? 'scale-100' : 'scale-0')} />
			</span>
			<span className="min-w-0 flex-1">
				<span className="flex items-baseline gap-3">
					<span className="tabular text-[0.7rem] text-brass">{String.fromCharCode(97 + index)}.</span>
					<span className="font-display text-[1.3rem] leading-tight text-charcoal">{customerTitle(provider.name) ?? provider.displayName}</span>
					{provider.mode === 'test' ? (
						<span className="eyebrow ml-auto border border-amber-300 px-1.5 py-0.5 text-[0.55rem] text-amber-700">Test</span>
					) : null}
				</span>
				<span className="mt-1.5 block text-sm leading-relaxed text-warm-gray">{customerCopy(provider.name) ?? provider.description}</span>
			</span>
		</label>
	);
}

/**
 * Customer-facing wording for the built-in providers. The catalog's own
 * displayName/description are written for merchants ("Record cash payments
 * collected outside the system"), so they're only a fallback for unknown ones.
 */
function customerTitle(name: string): string | undefined {
	switch (name) {
		case 'stripe':
			return 'Card';
		case 'cash':
			return 'Pay at the salon';
		case 'bank_transfer':
			return 'Bank transfer';
		default:
			return undefined;
	}
}

function customerCopy(name: string): string | undefined {
	switch (name) {
		case 'stripe':
			return 'Card, Apple Pay or Google Pay — paid securely now.';
		case 'cash':
			return 'Hold the chair now and settle up at the desk after your visit.';
		case 'bank_transfer':
			return 'We’ll email the transfer details with your confirmation.';
		default:
			return undefined;
	}
}

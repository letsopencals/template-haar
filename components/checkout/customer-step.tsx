'use client';

import Link from 'next/link';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fieldA11y } from '@/lib/field-errors';
import { Field } from './field';
import { DETAILS_FORM_ID } from './form-ids';

/** 01 — Your details. Submits through the context's handleSaveCustomer. */
export function CustomerStep() {
	const {
		email,
		firstName,
		lastName,
		customerId,
		fieldErrors,
		setEmail,
		setFirstName,
		setLastName,
		submitting,
		isExpired,
		handleSaveCustomer,
	} = useCheckout();

	return (
		<form id={DETAILS_FORM_ID} onSubmit={handleSaveCustomer} className="space-y-6">
			{customerId ? null : (
				<p className="text-sm text-warm-gray">
					Been with us before?{' '}
					<Link href="/auth/sign-in?callbackUrl=/checkout" className="link-underline text-charcoal hover:text-accent">
						Sign in
					</Link>{' '}
					and we&rsquo;ll fill this in.
				</p>
			)}
			<Field htmlFor="checkout-email" label="Email" required error={fieldErrors.email}>
				<Input
					id="checkout-email"
					type="email"
					required
					autoComplete="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="you@example.com"
					{...fieldA11y('checkout-email', fieldErrors.email)}
				/>
			</Field>
			<div className="grid gap-6 sm:grid-cols-2">
				<Field htmlFor="checkout-first-name" label="First name" error={fieldErrors.firstName}>
					<Input
						id="checkout-first-name"
						type="text"
						autoComplete="given-name"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						placeholder="Jane"
						{...fieldA11y('checkout-first-name', fieldErrors.firstName)}
					/>
				</Field>
				<Field htmlFor="checkout-last-name" label="Last name" error={fieldErrors.lastName}>
					<Input
						id="checkout-last-name"
						type="text"
						autoComplete="family-name"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						placeholder="Smith"
						{...fieldA11y('checkout-last-name', fieldErrors.lastName)}
					/>
				</Field>
			</div>
			<p className="text-xs leading-relaxed text-warm-gray">
				We&rsquo;ll send your confirmation and a reminder the day before. Nothing else unless you ask.
			</p>
			<Button
				type="submit"
				variant="primary"
				size="lg"
				className="max-lg:hidden"
				disabled={submitting || !email || isExpired}
			>
				{submitting ? 'Saving…' : 'Continue'}
				{submitting ? null : <span aria-hidden>→</span>}
			</Button>
		</form>
	);
}

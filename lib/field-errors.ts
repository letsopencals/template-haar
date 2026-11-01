import type { OpencalsApiError } from '@opencals/storefront-sdk';

/**
 * The API's field errors as `lib/api-error-handler.ts` passes them on (`fieldErrors` in the error JSON):
 * `property` is the full dotted path in the request body, e.g. `customer.phone` or `customer.billingAddress.city`.
 */
export type ApiFieldErrors = NonNullable<OpencalsApiError['errors']>;

/** Form field → the message shown under it. */
export type FieldErrors = Record<string, string>;

/** Path segments that open an address; a path inside one never matches a plain field (`billingAddress.phone` ≠ `phone`). */
const ADDRESS_SEGMENTS = new Set(['billingAddress', 'deliveryAddress', 'address']);

/**
 * The form field an error path belongs to: the longest of `fields` the path ends with, so `customer.phone` → `phone`
 * and `customer.billingAddress.city` → `billingAddress.city`. Undefined when no field on the form matches.
 */
export function fieldOf(property: string, fields: readonly string[]): string | undefined {
	let best: string | undefined;
	for (const field of fields) {
		if (property !== field && !property.endsWith(`.${field}`)) continue;
		const prefix = property.slice(0, property.length - field.length).split('.');
		if (prefix.some((segment) => ADDRESS_SEGMENTS.has(segment))) continue;
		if (!best || field.length > best.length) best = field;
	}
	return best;
}

/**
 * Splits the API's field errors into the ones a form shows under its fields and the messages it can't place (for the
 * banner). `alias` sends a path to another field, e.g. `billingAddress.phone` → `phone` when the billing address reuses
 * the contact phone.
 */
export function mapFieldErrors(
	errors: ApiFieldErrors | undefined,
	fields: readonly string[],
	alias: Record<string, string> = {},
): { fields: FieldErrors; unmapped: string[] } {
	const mapped: FieldErrors = {};
	const unmapped: string[] = [];
	const known = [...fields, ...Object.keys(alias)];
	for (const { property, messages } of errors ?? []) {
		const match = fieldOf(property, known);
		const field = match ? (alias[match] ?? match) : undefined;
		const text = messages.join(' ');
		if (!field) unmapped.push(text);
		// An aliased path can repeat the same message (the contact phone is also the billing phone): show it once.
		else if (!mapped[field]) mapped[field] = text;
		else if (!mapped[field].includes(text)) mapped[field] = `${mapped[field]} ${text}`;
	}
	return { fields: mapped, unmapped };
}

/** A copy of `errors` without `field`, or `errors` itself when there's nothing to clear (so state doesn't churn). */
export function withoutField(errors: FieldErrors, ...fields: string[]): FieldErrors {
	if (!fields.some((f) => f in errors)) return errors;
	const next = { ...errors };
	for (const f of fields) delete next[f];
	return next;
}

/** A phone without its country code. The API is the judge; this only catches the common local format early. */
export function missingCountryCode(phone: string): boolean {
	const p = phone.trim();
	return p !== '' && !p.startsWith('+');
}

/** `aria-invalid` / `aria-describedby` for an input with an optional hint and an error rendered as `${id}-hint` / `${id}-error`. */
export function fieldA11y(id: string, error: string | undefined, hint?: boolean) {
	const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ');
	return {
		'aria-invalid': error ? true : undefined,
		'aria-describedby': describedBy || undefined,
	} as const;
}

/** Under every phone input, and the message when the country code is missing. New York salon, so a US mobile. */
export const PHONE_EXAMPLE = '+1 917 412 3456';
export const PHONE_HINT = `Include your country code, e.g. ${PHONE_EXAMPLE}`;

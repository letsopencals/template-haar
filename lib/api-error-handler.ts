import { OpencalsApiError, type CheckoutErrorResponse } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';

/**
 * An API failure as JSON for the browser: the message, field errors (`errors` as path → text, and `fieldErrors`, the
 * API's own array with full dotted paths such as `customer.email`, see `lib/field-errors.ts`), and the machine-readable `code`
 * (e.g. CART_EXPIRED, CHECKOUT_IN_PROGRESS, PAYMENT_NOT_AUTHORIZED) plus `orderId` / `paymentStatus`
 * when the API sent them, so the checkout can react to the reason rather than the wording.
 */
export function handleApiError(err: unknown, fallbackMessage = 'Internal server error') {
	if (err instanceof OpencalsApiError) {
		// Checkout conflicts carry `orderId` (CART_ALREADY_CHECKED_OUT), unauthorised cards `paymentStatus`.
		// The SDK keeps the raw body as `Record<string, unknown>`; this is the one place it's read as the checkout error shape.
		const body = (err.body ?? {}) as Partial<CheckoutErrorResponse>;
		const fieldErrors = err.toFieldErrors();
		return NextResponse.json(
			{
				error: err.message,
				...(Object.keys(fieldErrors).length > 0 && { errors: fieldErrors }),
				...(err.errors?.length ? { fieldErrors: err.errors } : {}),
				...(err.code && { code: err.code }),
				...(typeof body.orderId === 'string' && { orderId: body.orderId }),
				...(typeof body.paymentStatus === 'string' && { paymentStatus: body.paymentStatus }),
			},
			{ status: err.status },
		);
	}

	console.error(fallbackMessage, err);
	return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

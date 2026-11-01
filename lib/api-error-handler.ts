import { OpencalsApiError } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';

/**
 * An API failure as JSON for the browser: the message, field errors, and the machine-readable `code`
 * (e.g. CART_EXPIRED, CHECKOUT_IN_PROGRESS, PAYMENT_NOT_AUTHORIZED) plus `orderId` / `paymentStatus`
 * when the API sent them, so the checkout can react to the reason rather than the wording.
 */
export function handleApiError(err: unknown, fallbackMessage = 'Internal server error') {
	if (err instanceof OpencalsApiError) {
		// Checkout conflicts carry `orderId` (CART_ALREADY_CHECKED_OUT), unauthorised cards `paymentStatus`.
		const body = ((err as { body?: Record<string, unknown> }).body ?? {}) as { orderId?: unknown; paymentStatus?: unknown };
		const fieldErrors = err.toFieldErrors();
		return NextResponse.json(
			{
				error: err.message,
				...(Object.keys(fieldErrors).length > 0 && { errors: fieldErrors }),
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

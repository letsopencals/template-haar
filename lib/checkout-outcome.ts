'use client';

import type { CheckoutResponse, PaymentInstructions, StorefrontAppointmentPendingReason } from '@opencals/storefront-sdk';

/**
 * What checkout submit answered, kept for the thank-you page in sessionStorage. Guests can't read the order
 * back, and the payment instructions (bank details, invoice link, due date) only come from submit.
 */
export interface CheckoutMemo {
	orderId: string;
	orderName: string | null;
	savedAt: number;
	/** The method the guest chose (provider name). */
	provider: string | null;
	paymentStatus: string | null;
	dueAt: string | null;
	instructions: PaymentInstructions | null;
	/** Why the booking waits, if it does (see `waitingReason`). */
	waiting: StorefrontAppointmentPendingReason | null;
}

const KEY = 'haar:checkout';
const MAX_AGE = 6 * 60 * 60 * 1000;

/**
 * The reason a set of appointments still waits, or null when the booking is confirmed. Only `pending` *with* a
 * reason counts: right after checkout an automatic salon's booking is briefly `pending` with no reason while it
 * is confirmed in the background. Payment comes before approval.
 */
export function waitingReason(
	appointments: ReadonlyArray<{ status: string; pendingReason?: StorefrontAppointmentPendingReason | null } | null | undefined>,
): StorefrontAppointmentPendingReason | null {
	const reasons = appointments.filter((a) => a?.status === 'pending').map((a) => a?.pendingReason ?? null);
	if (reasons.includes('awaiting_payment')) return 'awaiting_payment';
	if (reasons.includes('awaiting_approval')) return 'awaiting_approval';
	return null;
}

export function rememberCheckout(data: CheckoutResponse, provider: string | null): void {
	const order = data.order;
	if (!order?.id) return;
	const memo: CheckoutMemo = {
		orderId: order.id,
		orderName: order.name ?? null,
		savedAt: Date.now(),
		provider: data.paymentInstructions?.provider ?? provider,
		paymentStatus: order.paymentStatus ?? null,
		dueAt: data.paymentInstructions?.dueAt ?? order.paymentDueAt ?? null,
		instructions: data.paymentInstructions ?? null,
		waiting: waitingReason((order.lineItems ?? []).map((li) => li.appointment)),
	};
	try {
		sessionStorage.setItem(KEY, JSON.stringify(memo));
	} catch {
		/* private mode: the thank-you page points to the email instead */
	}
}

export function recallCheckout(orderId: string | null): CheckoutMemo | null {
	if (!orderId) return null;
	try {
		const raw = sessionStorage.getItem(KEY);
		if (!raw) return null;
		const memo = JSON.parse(raw) as CheckoutMemo;
		return memo.orderId === orderId && Date.now() - memo.savedAt < MAX_AGE ? memo : null;
	} catch {
		return null;
	}
}

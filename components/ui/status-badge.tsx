import { memo } from 'react';
import { clsx } from 'clsx';
import type { AppointmentStatusType, OrderDetailResponse, StorefrontAppointmentPendingReason } from '@opencals/storefront-sdk';

type Tone = 'accent' | 'positive' | 'neutral' | 'warning' | 'negative';
type Entry = { label: string; tone: Tone };

const TONE: Record<Tone, { text: string; dot: string }> = {
	accent: { text: 'text-accent-dark', dot: 'bg-accent' },
	positive: { text: 'text-emerald-800', dot: 'bg-emerald-600' },
	neutral: { text: 'text-warm-gray', dot: 'bg-warm-gray-light' },
	warning: { text: 'text-amber-800', dot: 'bg-amber-500' },
	negative: { text: 'text-red-700', dot: 'bg-red-500' },
};

/** `confirmed` is kept for older data. */
const APPOINTMENT: Record<AppointmentStatusType | StorefrontAppointmentPendingReason | 'confirmed', Entry> = {
	scheduled: { label: 'Booked', tone: 'accent' },
	confirmed: { label: 'Confirmed', tone: 'positive' },
	completed: { label: 'Completed', tone: 'neutral' },
	canceled: { label: 'Cancelled', tone: 'negative' },
	// A pending booking with no reason is being confirmed right now; it reads as booked.
	pending: { label: 'Booked', tone: 'accent' },
	awaiting_payment: { label: 'Awaiting payment', tone: 'warning' },
	awaiting_approval: { label: 'Awaiting confirmation', tone: 'warning' },
};

const PAYMENT: Record<OrderDetailResponse['paymentStatus'], Entry> = {
	paid: { label: 'Paid', tone: 'positive' },
	unpaid: { label: 'Unpaid', tone: 'warning' },
	'partially-paid': { label: 'Part paid', tone: 'warning' },
	voided: { label: 'Cancelled — not charged', tone: 'neutral' },
};

const FULFILLMENT: Record<OrderDetailResponse['fulfillmentStatus'], Entry> = {
	fulfilled: { label: 'Fulfilled', tone: 'positive' },
	unfulfilled: { label: 'Unfulfilled', tone: 'neutral' },
	'partially-fulfilled': { label: 'Part fulfilled', tone: 'warning' },
};

const REFUND: Record<OrderDetailResponse['refundStatus'], Entry> = {
	'refund-owed': { label: 'Refund owed', tone: 'negative' },
	'partially-refunded': { label: 'Part refunded', tone: 'warning' },
	'fully-refunded': { label: 'Refunded', tone: 'negative' },
	unrefunded: { label: 'Not refunded', tone: 'neutral' },
};

/** Looked up by any string: a status the API adds later falls back to the neutral wording below. */
const MAPS: Record<'appointment' | 'payment' | 'fulfillment' | 'refund', Partial<Record<string, Entry>>> = {
	appointment: APPOINTMENT,
	payment: PAYMENT,
	fulfillment: FULFILLMENT,
	refund: REFUND,
};

/** An unknown value never shows raw: each kind has a neutral wording for it. */
const FALLBACK: Record<keyof typeof MAPS, string> = {
	appointment: 'Updating',
	payment: 'Payment pending',
	fulfillment: 'In progress',
	refund: 'Refund pending',
};

/**
 * The appointment badge key: a `pending` booking shows why it waits (`awaiting_payment` /
 * `awaiting_approval`); with no reason it's being confirmed and reads as booked.
 */
export function appointmentBadgeStatus(a: {
	status: AppointmentStatusType;
	pendingReason?: StorefrontAppointmentPendingReason | null;
}): AppointmentStatusType | StorefrontAppointmentPendingReason {
	return a.status === 'pending' && a.pendingReason ? a.pendingReason : a.status;
}

/** Hairline status plate with a coloured dot. */
export const StatusBadge = memo(function StatusBadge({
	kind,
	status,
	className,
}: {
	kind: keyof typeof MAPS;
	status: string;
	className?: string;
}) {
	const c = MAPS[kind][status] ?? { label: FALLBACK[kind], tone: 'neutral' as Tone };
	const t = TONE[c.tone];
	return (
		<span
			className={clsx(
				'inline-flex items-center gap-2 border border-line-strong bg-paper/60 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.22em] whitespace-nowrap',
				t.text,
				className,
			)}
		>
			<span aria-hidden className={clsx('h-1.5 w-1.5 rounded-full', t.dot)} />
			{c.label}
		</span>
	);
});

import { memo } from 'react';
import { clsx } from 'clsx';

type Tone = 'accent' | 'positive' | 'neutral' | 'warning' | 'negative';

const TONE: Record<Tone, { text: string; dot: string }> = {
	accent: { text: 'text-accent-dark', dot: 'bg-accent' },
	positive: { text: 'text-emerald-800', dot: 'bg-emerald-600' },
	neutral: { text: 'text-warm-gray', dot: 'bg-warm-gray-light' },
	warning: { text: 'text-amber-800', dot: 'bg-amber-500' },
	negative: { text: 'text-red-700', dot: 'bg-red-500' },
};

const APPOINTMENT: Record<string, { label: string; tone: Tone }> = {
	scheduled: { label: 'Booked', tone: 'accent' },
	confirmed: { label: 'Confirmed', tone: 'positive' },
	completed: { label: 'Completed', tone: 'neutral' },
	canceled: { label: 'Cancelled', tone: 'negative' },
	pending: { label: 'Pending', tone: 'warning' },
};

const PAYMENT: Record<string, { label: string; tone: Tone }> = {
	paid: { label: 'Paid', tone: 'positive' },
	unpaid: { label: 'Unpaid', tone: 'warning' },
	'partially-paid': { label: 'Part paid', tone: 'warning' },
};

const FULFILLMENT: Record<string, { label: string; tone: Tone }> = {
	fulfilled: { label: 'Fulfilled', tone: 'positive' },
	unfulfilled: { label: 'Unfulfilled', tone: 'neutral' },
	'partially-fulfilled': { label: 'Part fulfilled', tone: 'warning' },
};

const REFUND: Record<string, { label: string; tone: Tone }> = {
	'refund-owed': { label: 'Refund owed', tone: 'negative' },
	'partially-refunded': { label: 'Part refunded', tone: 'warning' },
	'fully-refunded': { label: 'Refunded', tone: 'negative' },
	unrefunded: { label: 'Not refunded', tone: 'neutral' },
};

const MAPS = { appointment: APPOINTMENT, payment: PAYMENT, fulfillment: FULFILLMENT, refund: REFUND } as const;

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
	const c = MAPS[kind][status] ?? { label: status, tone: 'neutral' as Tone };
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

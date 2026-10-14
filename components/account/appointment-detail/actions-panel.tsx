'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { Button, buttonClasses } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { useSettings } from '@/contexts/settings-context';
import { formatPrice } from '@/lib/format';
import { AddToCalendar } from '@/components/account/add-to-calendar';
import { formatGap, type ChangePolicy } from '@/components/account/appointment-detail/policy';
import { bookAgainHref, toCalendarEvent } from '@/components/account/appointment-utils';

/**
 * The booking's side card: what you can do now (reschedule, cancel, add to
 * calendar), the policy in plain words, the order total and "Book again".
 */
export function ActionsPanel({
	appointment,
	policy,
	upcoming,
	onReschedule,
	onCancel,
}: {
	appointment: AppointmentDetailResponse;
	policy: ChangePolicy;
	upcoming: boolean;
	onReschedule: () => void;
	onCancel: () => void;
}) {
	const { currency: storeCurrency } = useSettings();
	const event = useMemo(() => toCalendarEvent(appointment), [appointment]);
	const order = appointment.order;
	const currency = order?.paymentCurrencyCode || storeCurrency;
	const scheduled = appointment.status === 'scheduled';
	const product = appointment.product;

	return (
		<aside className="space-y-6 lg:sticky lg:top-28">
			<div className="border border-line-strong bg-cream/60 p-6 sm:p-8">
				<p className="eyebrow text-brass">{upcoming ? 'Your visit' : 'This visit'}</p>

				{upcoming && scheduled ? (
					<div className="mt-6 grid gap-3">
						{policy.canReschedule ? (
							<Button onClick={onReschedule} fullWidth>
								Reschedule
							</Button>
						) : null}
						<AddToCalendar event={event} />
						{policy.canCancel ? (
							<button
								type="button"
								onClick={onCancel}
								className="eyebrow mt-1 py-2 text-red-700 transition-colors hover:text-red-900 focus-visible:outline-2 focus-visible:outline-accent"
							>
								Cancel booking
							</button>
						) : null}
					</div>
				) : (
					<div className="mt-6 grid gap-3">
						<Link href={bookAgainHref(appointment)} className={buttonClasses({ fullWidth: true })}>
							Book again
						</Link>
					</div>
				)}

				{upcoming && scheduled ? (
					<div className="mt-6 space-y-2 border-t border-line pt-5 text-xs leading-relaxed text-warm-gray">
						{product?.allowCustomerReschedule === false ? (
							<p>This service can’t be moved online. Please call the salon.</p>
						) : !policy.canReschedule ? (
							<p>Online changes close {formatGap(policy.rescheduleGap)} before the start. Please call the salon.</p>
						) : policy.rescheduleGap > 0 ? (
							<p>Move it up to {formatGap(policy.rescheduleGap)} before your visit.</p>
						) : null}
						{product?.allowCustomerCancel === false ? (
							<p>Cancellations are handled by the salon.</p>
						) : !policy.canCancel ? (
							<p>Online cancellation closed {formatGap(policy.cancelGap)} before the start.</p>
						) : policy.cancelGap > 0 ? (
							<p>Cancel up to {formatGap(policy.cancelGap)} before your visit.</p>
						) : null}
					</div>
				) : null}
			</div>

			{order ? (
				<Link
					href={`/account/orders/${order.id}`}
					className="group block border border-line p-6 transition-colors hover:border-charcoal/40 focus-visible:outline-2 focus-visible:outline-accent sm:p-8"
				>
					<div className="flex items-center justify-between gap-4">
						<p className="eyebrow text-warm-gray">Receipt Nº {order.name}</p>
						<StatusBadge kind="payment" status={order.paymentStatus} />
					</div>
					<div className="mt-4 flex items-baseline">
						<span className="text-sm text-charcoal">Total</span>
						<span aria-hidden className="leader-line" />
						<span className="tabular text-lg text-charcoal">{formatPrice(order.total, currency)}</span>
					</div>
					{order.dueToPay > 0 ? (
						<div className="mt-2 flex items-baseline text-sm text-amber-800">
							<span>Due at the salon</span>
							<span aria-hidden className="leader-line" />
							<span className="tabular">{formatPrice(order.dueToPay, currency)}</span>
						</div>
					) : null}
					<p className="eyebrow mt-5 text-charcoal transition-colors group-hover:text-accent">
						View receipt <span aria-hidden>→</span>
					</p>
				</Link>
			) : null}

			{upcoming && scheduled ? (
				<Link href={bookAgainHref(appointment)} className="eyebrow link-underline block text-center text-warm-gray hover:text-charcoal">
					Book this again
				</Link>
			) : null}
		</aside>
	);
}

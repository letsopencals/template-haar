'use client';

import Link from 'next/link';
import useSWR from 'swr';
import type { OrderDetailResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { StatusBadge } from '@/components/ui/status-badge';
import { buttonClasses } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { PanelSkeleton } from '@/components/account/skeletons';
import { DiaryEmpty } from '@/components/account/diary/diary-empty';

const SWR_OPTIONS = { revalidateOnFocus: false } as const;

/** Receipts show real zeroes (`£0.00`) rather than formatPrice's "Free". */
function receiptAmount(amount: number, currency: string): string {
	if (amount !== 0) return formatPrice(amount, currency);
	return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(0);
}

function Line({
	label,
	value,
	strong,
	tone,
	sub,
}: {
	label: React.ReactNode;
	value: string;
	strong?: boolean;
	tone?: 'accent' | 'warning' | 'negative';
	sub?: boolean;
}) {
	const color =
		tone === 'accent' ? 'text-accent' : tone === 'warning' ? 'text-amber-800' : tone === 'negative' ? 'text-red-700' : 'text-charcoal';
	return (
		<div className={`flex items-baseline ${sub ? 'pl-5 text-xs' : 'text-sm'} ${strong ? 'py-1' : 'py-1.5'}`}>
			<span className={`${sub ? 'text-warm-gray' : color} ${strong ? 'font-display text-xl' : ''}`}>{label}</span>
			<span aria-hidden className="leader-line" />
			<span className={`tabular ${color} ${strong ? 'text-xl' : ''}`}>{value}</span>
		</div>
	);
}

/** One order as a paper receipt: perforated, tabular, with leader lines. */
export function OrderReceipt({ orderId }: { orderId: string }) {
	const { data: order, error, isLoading } = useSWR<OrderDetailResponse>(`/api/account/orders/${orderId}`, fetcher, SWR_OPTIONS);
	const { formatCustom, formatTime } = useDateFormatter();

	if (error && !order) {
		return (
			<DiaryEmpty
				title={
					<>
						Receipt not <em>found</em>.
					</>
				}
				body="We couldn’t find this receipt in your account."
				cta={false}
			/>
		);
	}
	if (isLoading || !order) return <PanelSkeleton />;

	const currency = order.paymentCurrencyCode;
	const lineItems = order.lineItems ?? [];
	const discount = lineItems.reduce(
		(acc, li) => acc + (li.totalDiscount ?? 0) + (li.addOnLineItems ?? []).reduce((a, ao) => a + (ao.totalDiscount ?? 0), 0),
		0,
	);
	const money = (n: number) => receiptAmount(n, currency);

	return (
		<div>
			<Link
				href="/account/orders"
				className="eyebrow inline-flex items-center gap-3 text-warm-gray transition-colors hover:text-charcoal focus-visible:outline-2 focus-visible:outline-accent"
			>
				<span aria-hidden>←</span> All receipts
			</Link>

			<Reveal className="mx-auto mt-10 max-w-2xl">
				<article className="grain relative border border-line-strong bg-white/70 shadow-[0_30px_70px_-45px_rgba(28,25,23,0.45)]">
					<div className="relative z-[2] px-6 pt-10 pb-8 text-center sm:px-12">
						<p className="font-display text-3xl tracking-tight text-charcoal">
							{siteConfig.logo.text}
							<span className="text-accent">{siteConfig.logo.accent}</span>
						</p>
						<p className="eyebrow mt-4 text-brass">Receipt Nº {order.name}</p>
						<p className="tabular mt-2 text-xs text-warm-gray">
							{formatCustom(order.createdAt, 'D MMMM YYYY')} · {formatTime(order.createdAt)}
						</p>
						<div className="mt-5 flex flex-wrap justify-center gap-2">
							<StatusBadge kind="payment" status={order.paymentStatus} />
							<StatusBadge kind="fulfillment" status={order.fulfillmentStatus} />
							{order.refundStatus !== 'unrefunded' ? <StatusBadge kind="refund" status={order.refundStatus} /> : null}
						</div>
					</div>

					<div className="perforation relative z-[2]" aria-hidden />

					<div className="relative z-[2] px-6 py-8 sm:px-12">
						<p className="eyebrow mb-4 text-warm-gray">Services</p>
						<ul className="space-y-5">
							{lineItems.map((li, i) => {
								const appt = li.appointment;
								const stylist = appt?.staffMember ? [appt.staffMember.firstName, appt.staffMember.lastName].filter(Boolean).join(' ') : null;
								return (
									<li key={appt?.id ?? i}>
										<Line
											label={
												<>
													{appt?.product?.title ?? 'Service'}
													{li.quantity > 1 ? <span className="tabular text-warm-gray"> × {li.quantity}</span> : null}
												</>
											}
											value={money(li.discountedSubtotal ?? li.discountedTotal)}
										/>
										{appt ? (
											<p className="text-xs text-warm-gray">
												<span className="tabular">
													{formatCustom(appt.from, 'ddd D MMM')} · {formatTime(appt.from)}
												</span>
												{stylist ? ` · ${stylist}` : ''}
												{' · '}
												<Link href={`/account/appointments/${appt.id}`} className="link-underline text-charcoal hover:text-accent">
													View booking
												</Link>
											</p>
										) : null}
										{li.discountedUnitPrice < li.originalUnitPrice ? (
											<p className="tabular text-xs text-warm-gray line-through">
												{formatPrice(li.originalUnitPrice * li.quantity, currency)}
											</p>
										) : null}
										{(li.addOnLineItems ?? []).map((ao) => (
											<Line
												key={ao.id}
												sub
												label={
													<>
														+ {ao.addOn?.title ?? 'Add-on'}
														{ao.quantity > 1 ? <span className="tabular"> × {ao.quantity}</span> : null}
													</>
												}
												value={money(ao.discountedSubtotal)}
											/>
										))}
									</li>
								);
							})}
						</ul>
					</div>

					<div className="perforation relative z-[2]" aria-hidden />

					<div className="relative z-[2] px-6 py-8 sm:px-12">
						<Line label="Subtotal" value={money(order.subtotal)} />
						{discount > 0 ? <Line label="Discounts" value={`−${formatPrice(discount, currency)}`} tone="accent" /> : null}
						{order.totalTax > 0 ? (
							<Line label={order.taxesIncluded ? 'Tax (included)' : 'Tax'} value={money(order.totalTax)} />
						) : null}
						<div className="my-3 h-px bg-charcoal" aria-hidden />
						<Line label="Total" value={formatPrice(order.total, currency)} strong />

						<div className="mt-6 space-y-0.5 border-t border-line pt-4">
							<Line label="Paid" value={money(order.paidTotal)} />
							{order.refundedTotal > 0 ? (
								<Line label="Refunded" value={`−${formatPrice(order.refundedTotal, currency)}`} tone="negative" />
							) : null}
							{order.dueToPay > 0 ? <Line label="Due at the salon" value={formatPrice(order.dueToPay, currency)} tone="warning" /> : null}
						</div>
					</div>

					<div className="perforation relative z-[2]" aria-hidden />
					<p className="relative z-[2] px-6 py-6 text-center font-display text-base italic text-warm-gray">
						Thank you for sitting with us.
					</p>
				</article>

				<div className="mt-10 flex justify-center">
					<Link href="/services" className={buttonClasses({ variant: 'outline' })}>
						Book another service
					</Link>
				</div>
			</Reveal>
		</div>
	);
}

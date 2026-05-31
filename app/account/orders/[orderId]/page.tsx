'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import type { Order, OrderLineItem, AppointmentStatusType } from '@opencals/storefront-sdk';

export default function OrderDetailPage() {
	const { orderId } = useParams<{ orderId: string }>();
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(true);
	const { formatCustom, formatTime } = useDateFormatter();

	useEffect(() => {
		async function fetchOrder() {
			try {
				const res = await fetch(`/api/account/orders/${orderId}`);
				if (res.ok) {
					setOrder(await res.json());
				}
			} catch {
				// silently fail
			} finally {
				setLoading(false);
			}
		}
		fetchOrder();
	}, [orderId]);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 animate-pulse rounded bg-cream" />
				<div className="h-64 animate-pulse rounded bg-cream" />
			</div>
		);
	}

	if (!order) {
		return (
			<div className="text-center">
				<p className="text-sm text-warm-gray">Order not found</p>
				<Link href="/account/orders" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
					Back to orders
				</Link>
			</div>
		);
	}

	const currency = order.paymentCurrencyCode;
	const lineItems = order.lineItems ?? [];
	const appointments = order.appointments ?? [];

	return (
		<div>
			{/* Header */}
			<div className="flex items-center gap-3">
				<Link href="/account/orders" className="text-warm-gray transition-colors hover:text-charcoal">
					<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
					</svg>
				</Link>
				<div>
					<h1 className="font-display text-2xl font-semibold text-charcoal">
						Order #{order.name}
					</h1>
					<p className="mt-0.5 text-xs text-warm-gray">
						{formatCustom(order.createdAt, 'dddd, MMMM D, YYYY')}
					</p>
				</div>
			</div>

			{/* Status badges */}
			<div className="mt-4 flex flex-wrap gap-2">
				<PaymentStatusBadge status={order.paymentStatus} />
				<FulfillmentStatusBadge status={order.fulfillmentStatus} />
				{order.refundStatus !== 'unrefunded' && (
					<RefundStatusBadge status={order.refundStatus} />
				)}
			</div>

			<div className="mt-8 grid gap-8 lg:grid-cols-3">
				{/* Main content */}
				<div className="space-y-6 lg:col-span-2">
					{/* Appointments */}
					{appointments.length > 0 && (
						<div className="border border-charcoal/10 p-6">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
								Appointments
							</h2>
							<div className="mt-4 divide-y divide-charcoal/5">
								{appointments.map((appt) => (
										<Link
											key={appt.id}
											href={`/account/appointments/${appt.id}`}
											className="block py-4 first:pt-0 last:pb-0 transition-colors hover:bg-cream/30"
										>
											<div className="flex items-start justify-between">
												<div>
													<p className="text-sm font-medium text-charcoal">
														{appt.product?.title ?? 'Service'}
													</p>
													<p className="mt-1 text-xs text-warm-gray">
														{formatCustom(appt.from, 'ddd, MMM D')}
														{' at '}
														{formatTime(appt.from)}
														{' - '}
														{formatTime(appt.to)}
													</p>
													{appt.staffMember && (
														<p className="mt-0.5 text-xs text-warm-gray">
															with {[appt.staffMember.firstName, appt.staffMember.lastName].filter(Boolean).join(' ')}
														</p>
													)}
													{appt.location?.title && (
														<p className="mt-0.5 text-xs text-warm-gray">{appt.location.title}</p>
													)}
												</div>
												<AppointmentStatusBadge status={appt.status} />
											</div>
										</Link>
								))}
							</div>
						</div>
					)}

					{/* Line Items */}
					{lineItems.length > 0 && (
						<div className="border border-charcoal/10 p-6">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
								Items
							</h2>
							<div className="mt-4 divide-y divide-charcoal/5">
								{lineItems.map((item: OrderLineItem, i: number) => (
									<div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
										<div>
											<p className="text-sm text-charcoal">
												{item.appointment?.product?.title ?? 'Service'}
											</p>
											{item.quantity > 1 && (
												<p className="text-xs text-warm-gray">Qty: {item.quantity}</p>
											)}
											{item.discountedUnitPrice < item.originalUnitPrice && (
												<p className="text-xs text-warm-gray line-through">
													{formatPrice(item.originalUnitPrice, currency)}
												</p>
											)}
										</div>
										<p className="text-sm font-medium text-charcoal">
											{formatPrice(item.total, currency)}
										</p>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Sidebar - Order Summary */}
				<div className="space-y-6">
					<div className="border border-charcoal/10 p-6">
						<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
							Order Summary
						</h2>
						<div className="mt-4 space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-warm-gray">Subtotal</span>
								<span className="text-charcoal">{formatPrice(order.subtotal, currency)}</span>
							</div>
							{order.totalTax > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-warm-gray">Tax</span>
									<span className="text-charcoal">{formatPrice(order.totalTax, currency)}</span>
								</div>
							)}
							<div className="flex justify-between border-t border-charcoal/10 pt-2">
								<span className="text-sm font-semibold text-charcoal">Total</span>
								<span className="text-lg font-bold text-charcoal">
									{formatPrice(order.total, currency)}
								</span>
							</div>
						</div>

						{/* Payment details */}
						<div className="mt-4 space-y-2 border-t border-charcoal/10 pt-4">
							<div className="flex justify-between text-sm">
								<span className="text-warm-gray">Paid</span>
								<span className="text-charcoal">{formatPrice(order.paidTotal, currency)}</span>
							</div>
							{order.refundedTotal > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-warm-gray">Refunded</span>
									<span className="text-red-600">-{formatPrice(order.refundedTotal, currency)}</span>
								</div>
							)}
							{order.dueToPay > 0 && (
								<div className="flex justify-between text-sm">
									<span className="font-medium text-amber-600">Amount Due</span>
									<span className="font-medium text-amber-600">{formatPrice(order.dueToPay, currency)}</span>
								</div>
							)}
						</div>
					</div>

					<Link
						href="/services"
						className="flex w-full items-center justify-center gap-2 border border-charcoal/10 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-cream"
					>
						Book Another Service
					</Link>
				</div>
			</div>
		</div>
	);
}

function PaymentStatusBadge({ status }: { status: Order['paymentStatus'] }) {
	const config: Record<string, { bg: string; text: string; label: string }> = {
		paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
		unpaid: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Unpaid' },
		'partially-paid': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Partially Paid' },
	};
	const c = config[status] ?? { bg: 'bg-charcoal/10', text: 'text-charcoal', label: status };
	return (
		<span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${c.bg} ${c.text}`}>
			{c.label}
		</span>
	);
}

function FulfillmentStatusBadge({ status }: { status: Order['fulfillmentStatus'] }) {
	const config: Record<string, { bg: string; text: string; label: string }> = {
		fulfilled: { bg: 'bg-green-100', text: 'text-green-700', label: 'Fulfilled' },
		unfulfilled: { bg: 'bg-charcoal/10', text: 'text-charcoal', label: 'Unfulfilled' },
		'partially-fulfilled': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Partially Fulfilled' },
	};
	const c = config[status] ?? { bg: 'bg-charcoal/10', text: 'text-charcoal', label: status };
	return (
		<span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${c.bg} ${c.text}`}>
			{c.label}
		</span>
	);
}

function RefundStatusBadge({ status }: { status: Order['refundStatus'] }) {
	const config: Record<string, { bg: string; text: string; label: string }> = {
		'refund-owed': { bg: 'bg-red-100', text: 'text-red-700', label: 'Refund Owed' },
		'partially-refunded': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Partially Refunded' },
		'fully-refunded': { bg: 'bg-red-100', text: 'text-red-700', label: 'Fully Refunded' },
	};
	const c = config[status] ?? { bg: 'bg-charcoal/10', text: 'text-charcoal', label: status };
	return (
		<span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${c.bg} ${c.text}`}>
			{c.label}
		</span>
	);
}

function AppointmentStatusBadge({ status }: { status: AppointmentStatusType }) {
	const config: Record<string, { bg: string; text: string; label: string }> = {
		scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
		completed: { bg: 'bg-charcoal/10', text: 'text-charcoal', label: 'Completed' },
		canceled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Canceled' },
		pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
	};
	const c = config[status] ?? { bg: 'bg-charcoal/10', text: 'text-charcoal', label: status };
	return (
		<span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${c.bg} ${c.text}`}>
			{c.label}
		</span>
	);
}

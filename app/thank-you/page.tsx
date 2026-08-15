'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import type { Order, OrderLineItem, OrderTransaction } from '@opencals/storefront-sdk';

export default function ThankYouPage() {
	return (
		<Suspense fallback={<div className="flex min-h-screen items-center justify-center">
			<div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"/>
		</div>}>
			<ThankYouContent/>
		</Suspense>
	);
}

function ThankYouContent() {
	const searchParams = useSearchParams();
	const orderId = searchParams.get('orderId');
	const {status: authStatus} = useSession();

	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState(!!orderId);

	useEffect(() => {
		if (!orderId) return;

		async function fetchOrder() {
			try {
				const res = await fetch(`/api/account/orders/${orderId}`);
				if (res.ok) {
					setOrder(await res.json());
				}
			} catch {
				// Order fetch failed — show basic confirmation
			} finally {
				setLoading(false);
			}
		}

		fetchOrder();
	}, [orderId]);

	const {formatCustom, formatDate} = useDateFormatter();
	const appointments = order?.appointments ?? [];
	const lineItems: OrderLineItem[] = order?.lineItems ?? [];
	const currency = order?.paymentCurrencyCode ?? 'USD';
	const transactions = order?.transactions;
	const successTransaction = transactions?.find((t: OrderTransaction) => t.status === 'success');

	return (
		<section className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-32">
			<div className="mx-auto max-w-[1100px] px-6 lg:px-10">
				{/* Success banner */}
				<motion.div
					initial={{opacity: 0, scale: 0.95}}
					animate={{opacity: 1, scale: 1}}
					transition={{duration: 0.5}}
					className="text-center"
				>
					<div className="mx-auto flex h-16 w-16 items-center justify-center bg-accent/10">
						<svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"
						     strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
						</svg>
					</div>

					<h1 className="mt-6 font-display text-3xl font-semibold text-charcoal md:text-4xl">
						Thank you for your booking!
					</h1>

					{order?.name && (
						<p className="mt-3 text-sm text-warm-gray">
							Order <span className="font-semibold text-charcoal">#{order.name}</span> has been confirmed.
						</p>
					)}

					{order?.customer?.email && (
						<p className="mt-1 text-sm text-warm-gray">
							A confirmation has been sent to{' '}
							<span className="font-medium text-charcoal">{order.customer.email}</span>.
						</p>
					)}
				</motion.div>

				{loading ? (
					<div className="mt-12 space-y-6">
						<div className="h-48 animate-pulse rounded bg-cream"/>
						<div className="h-48 animate-pulse rounded bg-cream"/>
					</div>
				) : (
					<div className="mt-12 grid gap-8 lg:grid-cols-3">
						{/* Main content */}
						<div className="space-y-6 lg:col-span-2">
							{/* Appointments */}
							{appointments.length > 0 && (
								<div className="border border-charcoal/10 p-6">
									<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
										Your Appointments
									</h2>
									<div className="mt-4 divide-y divide-charcoal/5">
										{appointments.map((appt, i) => (
											<div key={appt.id ?? i} className="py-4 first:pt-0 last:pb-0">
												<div className="flex items-start justify-between">
													<p className="text-sm font-medium text-charcoal">
														{appt.product?.title ?? 'Service'}
													</p>
													<AppointmentStatusBadge status={appt.status}/>
												</div>

												<div className="mt-3 space-y-2">
													{/* Date & Time */}
													{appt.from && (
														<div className="flex items-center gap-2 text-xs text-warm-gray">
															<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
															     stroke="currentColor" strokeWidth={1.5}>
																<path strokeLinecap="round" strokeLinejoin="round"
																      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
															</svg>
															<span>
																{formatCustom(appt.from, 'dddd, MMMM D, YYYY')}
															</span>
															<span>
																{formatCustom(appt.from, 'h:mm A')}
																{appt.to && (
																	<>
																		{' - '}
																		{formatCustom(appt.to, 'h:mm A')}
																	</>
																)}
															</span>
														</div>
													)}

													{/* Location */}
													{appt.location?.title && (
														<div className="flex items-center gap-2 text-xs text-warm-gray">
															<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
															     stroke="currentColor" strokeWidth={1.5}>
																<path strokeLinecap="round" strokeLinejoin="round"
																      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
																<path strokeLinecap="round" strokeLinejoin="round"
																      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
															</svg>
															<span>{appt.location.title}</span>
														</div>
													)}

													{/* Staff */}
													{appt.staffMember && (
														<div className="flex items-center gap-2 text-xs text-warm-gray">
															<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
															     stroke="currentColor" strokeWidth={1.5}>
																<path strokeLinecap="round" strokeLinejoin="round"
																      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
															</svg>
															<span>
																{[appt.staffMember.firstName, appt.staffMember.lastName].filter(Boolean).join(' ')}
															</span>
														</div>
													)}

													{/* Add-ons */}
													{(() => {
														const addOns = appt.addOns ?? [];
														if (!addOns.length) return null;
														return (
															<div className="mt-3 border-t border-charcoal/10 pt-3 space-y-1">
																<p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-warm-gray">
																	Add-ons
																</p>
																{addOns.map((a, idx) => (
																	<div key={a.id ?? `${a.addOnId}-${idx}`} className="flex items-center justify-between text-xs text-charcoal">
																		<span>
																			{a.addOn?.title ?? 'Add-on'}
																			{(a.quantity ?? 1) > 1 && ` × ${a.quantity}`}
																		</span>
																	</div>
																))}
															</div>
														);
													})()}

													{/* Attendees */}
													{appt.numberOfAttendees > 1 && (
														<div className="flex items-center gap-2 text-xs text-warm-gray">
															<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
															     stroke="currentColor" strokeWidth={1.5}>
																<path strokeLinecap="round" strokeLinejoin="round"
																      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
															</svg>
															<span>{appt.numberOfAttendees} attendees</span>
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Payment Information */}
							<div className="border border-charcoal/10 p-6">
								<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
									Payment Information
								</h2>
								<div className="mt-4 space-y-3">
									{successTransaction && (
										<>
											<div className="flex justify-between text-sm">
												<span className="text-warm-gray">Payment Method</span>
												<span className="font-medium capitalize text-charcoal">
													{successTransaction.gateway ?? 'N/A'}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-warm-gray">Amount</span>
												<span className="font-medium text-charcoal">
													{formatPrice(successTransaction.amount ?? 0, currency)}
												</span>
											</div>
											{successTransaction.createdAt && (
												<div className="flex justify-between text-sm">
													<span className="text-warm-gray">Date</span>
													<span className="font-medium text-charcoal">
														{formatDate(successTransaction.createdAt)}
													</span>
												</div>
											)}
										</>
									)}
									<div className="flex justify-between text-sm">
										<span className="text-warm-gray">Status</span>
										<span
											className={`font-medium ${order?.isFullyPaid ? 'text-green-600' : 'text-amber-600'}`}>
											{order?.isFullyPaid ? 'Paid' : 'Pending'}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							{/* Order Summary */}
							<div className="border border-charcoal/10 p-6">
								<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
									Order Summary
								</h2>
								{lineItems.length > 0 && (
									<div className="mt-4 divide-y divide-charcoal/5">
										{lineItems.map((item, i) => {
											const addOnLineItems = item.addOnLineItems ?? [];
											return (
												<div key={i} className="py-2">
													<div className="flex justify-between">
														<div>
															<p className="text-sm text-charcoal">
																{item.appointment?.product?.title ?? 'Service'}
															</p>
															{item.quantity > 1 && (
																<p className="text-xs text-warm-gray">Qty: {item.quantity}</p>
															)}
														</div>
														<p className="text-sm font-medium text-charcoal">
															{formatPrice(item.total ?? 0, currency)}
														</p>
													</div>
													{addOnLineItems.length > 0 && (
														<div className="mt-1 ml-2 space-y-0.5">
															{addOnLineItems.map((aoli, j) => (
																<div key={j} className="flex justify-between text-xs text-warm-gray">
																	<span>
																		{aoli.addOn?.title ?? 'Add-on'}
																		{aoli.quantity > 1 && ` × ${aoli.quantity}`}
																	</span>
																	<span className="font-medium">
																		{formatPrice(aoli.discountedUnitPrice * aoli.quantity, currency)}
																	</span>
																</div>
															))}
														</div>
													)}
												</div>
											);
										})}
									</div>
								)}

								{(() => {
									const totalDiscount = (order?.lineItems ?? []).reduce((acc: number, item) => {
										const base = (item.originalUnitPrice - item.discountedUnitPrice) * item.quantity;
										const addOns = (item.addOnLineItems ?? []).reduce((a: number, ao) => a + (ao.originalUnitPrice - ao.discountedUnitPrice) * ao.quantity, 0);
										return acc + base + addOns;
									}, 0);
									return (
										<div className="mt-4 space-y-2 border-t border-charcoal/10 pt-4">
											<div className="flex justify-between text-sm">
												<span className="text-warm-gray">Subtotal</span>
												<span className="text-charcoal">{formatPrice(order?.subtotal ?? 0, currency)}</span>
											</div>
											{totalDiscount > 0 && (
												<div className="flex justify-between text-sm">
													<span className="text-accent">Discounts</span>
													<span className="font-medium text-accent">-{formatPrice(totalDiscount, currency)}</span>
												</div>
											)}
											{(order?.totalTax ?? 0) > 0 && (
												<div className="flex justify-between text-sm">
													<span className="text-warm-gray">Tax</span>
													<span className="text-charcoal">{formatPrice(order?.totalTax ?? 0, currency)}</span>
												</div>
											)}
											<div className="flex justify-between border-t border-charcoal/10 pt-2">
												<span className="text-sm font-semibold text-charcoal">Total</span>
												<span className="text-lg font-bold text-charcoal">
													{formatPrice(order?.total ?? 0, currency)}
												</span>
											</div>
										</div>
									);
								})()}
							</div>

							{/* Actions */}
							<div className="space-y-3">
								{authStatus === 'authenticated' ? (
									<>
										<Link
											href="/account/appointments"
											className="flex w-full items-center justify-center gap-2 bg-charcoal px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent"
										>
											View Appointments
										</Link>
										<Link
											href="/account/orders"
											className="flex w-full items-center justify-center gap-2 border border-charcoal/10 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-cream"
										>
											View Orders
										</Link>
									</>
								) : (
									<div className="border border-accent/20 bg-accent/5 p-4">
										<p className="text-xs font-medium text-charcoal">Create an account</p>
										<p className="mt-1 text-xs text-warm-gray">
											Sign up to manage your appointments and view order history.
										</p>
										<Link
											href="/auth/sign-up"
											className="mt-3 inline-block text-xs font-semibold text-accent hover:underline"
										>
											Sign Up
										</Link>
									</div>
								)}
								<Link
									href="/services"
									className="flex w-full items-center justify-center gap-2 border border-charcoal/10 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-cream"
								>
									Book Another Service
								</Link>
							</div>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

function AppointmentStatusBadge({status}: { status?: string }) {
	const normalized = (status ?? '').toLowerCase().replace(/_/g, ' ');
	const isScheduled = normalized === 'scheduled';

	return (
		<span
			className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${
				isScheduled ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
			}`}
		>
			{isScheduled ? 'Scheduled' : normalized || 'Pending'}
		</span>
	);
}

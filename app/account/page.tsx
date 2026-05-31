'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import type { Appointment, Order, CollectionMeta, AppointmentStatusType } from '@opencals/storefront-sdk';

type OrderWithId = Order & { id: string };

export default function AccountDashboard() {
	const { data: session } = useSession();
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [orders, setOrders] = useState<OrderWithId[]>([]);
	const [loading, setLoading] = useState(true);
	const { formatCustom, formatTime, formatDate } = useDateFormatter();

	useEffect(() => {
		async function fetchData() {
			try {
				const [apptRes, ordersRes] = await Promise.all([
					fetch('/api/account/appointments?take=5'),
					fetch('/api/account/orders?take=5'),
				]);

				if (apptRes.ok) {
					const data: { data: Appointment[]; meta: CollectionMeta } = await apptRes.json();
					setAppointments(data.data ?? []);
				}
				if (ordersRes.ok) {
					const data: { data: OrderWithId[]; meta: CollectionMeta } = await ordersRes.json();
					setOrders(data.data ?? []);
				}
			} catch {
				// silently fail
			} finally {
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	const firstName = session?.customer?.firstName;

	return (
		<div>
			<h1 className="font-display text-3xl font-semibold text-charcoal">
				{firstName ? `Welcome, ${firstName}` : 'Dashboard'}
			</h1>
			<p className="mt-2 text-sm text-warm-gray">Manage your appointments and account settings</p>

			{loading ? (
				<div className="mt-8 space-y-6">
					<div className="h-40 animate-pulse rounded bg-cream" />
					<div className="h-40 animate-pulse rounded bg-cream" />
				</div>
			) : (
				<div className="mt-8 space-y-8">
					{/* Upcoming Appointments */}
					<div className="border border-charcoal/10 p-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
								Upcoming Appointments
							</h2>
							<Link href="/account/appointments" className="text-xs font-medium text-accent hover:underline">
								View all
							</Link>
						</div>
						{appointments.length === 0 ? (
							<div className="mt-6 text-center">
								<p className="text-sm text-warm-gray">No upcoming appointments</p>
								<Link
									href="/services"
									className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
								>
									Book a service
								</Link>
							</div>
						) : (
							<div className="mt-4 divide-y divide-charcoal/5">
								{appointments.slice(0, 3).map((appt) => (
									<Link key={appt.id} href={`/account/appointments/${appt.id}`} className="flex items-center justify-between py-3 transition-colors hover:bg-cream/50">
										<div>
											<p className="text-sm font-medium text-charcoal">
												{appt.product?.title ?? 'Appointment'}
											</p>
											<p className="mt-0.5 text-xs text-warm-gray">
												{formatCustom(appt.from, 'ddd, MMM D')}
												{' at '}
												{formatTime(appt.from)}
											</p>
										</div>
										<AppointmentStatusBadge status={appt.status} />
									</Link>
								))}
							</div>
						)}
					</div>

					{/* Recent Orders */}
					<div className="border border-charcoal/10 p-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
								Recent Orders
							</h2>
							<Link href="/account/orders" className="text-xs font-medium text-accent hover:underline">
								View all
							</Link>
						</div>
						{orders.length === 0 ? (
							<div className="mt-6 text-center">
								<p className="text-sm text-warm-gray">No orders yet</p>
							</div>
						) : (
							<div className="mt-4 divide-y divide-charcoal/5">
								{orders.slice(0, 3).map((order) => (
									<Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between py-3 transition-colors hover:bg-cream/50">
										<div>
											<p className="text-sm font-medium text-charcoal">
												Order #{order.name}
											</p>
											<p className="mt-0.5 text-xs text-warm-gray">
												{formatDate(order.createdAt)}
											</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-semibold text-charcoal">
												{formatPrice(order.total, order.paymentCurrencyCode)}
											</p>
											<OrderStatusBadge status={order.paymentStatus} />
										</div>
									</Link>
								))}
							</div>
						)}
					</div>

					{/* Quick actions */}
					<div className="grid gap-4 sm:grid-cols-2">
						<Link
							href="/services"
							className="flex items-center gap-4 border border-charcoal/10 p-5 transition-colors hover:border-charcoal/30"
						>
							<div className="flex h-10 w-10 items-center justify-center bg-cream">
								<svg className="h-5 w-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
								</svg>
							</div>
							<div>
								<p className="text-sm font-medium text-charcoal">Book a Service</p>
								<p className="text-xs text-warm-gray">Schedule your next appointment</p>
							</div>
						</Link>
						<Link
							href="/account/settings"
							className="flex items-center gap-4 border border-charcoal/10 p-5 transition-colors hover:border-charcoal/30"
						>
							<div className="flex h-10 w-10 items-center justify-center bg-cream">
								<svg className="h-5 w-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							</div>
							<div>
								<p className="text-sm font-medium text-charcoal">Account Settings</p>
								<p className="text-xs text-warm-gray">Update your profile and password</p>
							</div>
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}

function AppointmentStatusBadge({ status }: { status: AppointmentStatusType }) {
	const config: Record<string, { bg: string; text: string; label: string }> = {
		scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
		confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
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

function OrderStatusBadge({ status }: { status: Order['paymentStatus'] }) {
	const config: Record<string, { bg: string; text: string; label: string }> = {
		paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
		unpaid: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Unpaid' },
		'partially-paid': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Partial' },
	};

	const c = config[status] ?? { bg: 'bg-charcoal/10', text: 'text-charcoal', label: status };

	return (
		<span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${c.bg} ${c.text}`}>
			{c.label}
		</span>
	);
}

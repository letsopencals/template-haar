'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDuration, formatPrice } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import type { Appointment, AppointmentStatusType, CurrentAvailabilitySlot } from '@opencals/storefront-sdk';

type ModalState = 'none' | 'cancel' | 'reschedule';

export default function AppointmentDetailPage() {
	const { appointmentId } = useParams<{ appointmentId: string }>();
	const router = useRouter();
	const [appointment, setAppointment] = useState<Appointment | null>(null);
	const [loading, setLoading] = useState(true);
	const [modal, setModal] = useState<ModalState>('none');

	const fetchAppointment = useCallback(async () => {
		try {
			const res = await fetch(`/api/account/appointments/${appointmentId}`);
			if (res.ok) {
				setAppointment(await res.json());
			}
		} catch {
			// silently fail
		} finally {
			setLoading(false);
		}
	}, [appointmentId]);

	const { formatCustom, formatTime } = useDateFormatter();

	useEffect(() => {
		fetchAppointment();
	}, [fetchAppointment]);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="h-8 w-48 animate-pulse rounded bg-cream" />
				<div className="h-64 animate-pulse rounded bg-cream" />
			</div>
		);
	}

	if (!appointment) {
		return (
			<div className="text-center">
				<p className="text-sm text-warm-gray">Appointment not found</p>
				<Link href="/account/appointments" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
					Back to appointments
				</Link>
			</div>
		);
	}

	const durationMin = appointment.from && appointment.to
		? Math.round((new Date(appointment.to).getTime() - new Date(appointment.from).getTime()) / 60000)
		: 0;

	const isScheduled = appointment.status === 'scheduled';
	const now = Date.now();
	const appointmentStart = new Date(appointment.from).getTime();

	const cancelGapMs = (appointment.product?.cancelGap ?? 0) * 1000;
	const rescheduleGapMs = (appointment.product?.rescheduleGap ?? 0) * 1000;

	const canCancel = isScheduled && (appointmentStart - cancelGapMs) > now;
	const canReschedule = isScheduled && (appointmentStart - rescheduleGapMs) > now;

	return (
		<div>
			{/* Header */}
			<div className="flex items-center gap-3">
				<Link href="/account/appointments" className="text-warm-gray transition-colors hover:text-charcoal">
					<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
					</svg>
				</Link>
				<div>
					<h1 className="font-display text-2xl font-semibold text-charcoal">
						{appointment.product?.title ?? 'Appointment'}
					</h1>
					<p className="mt-0.5 text-xs text-warm-gray">Appointment #{appointment.name}</p>
				</div>
			</div>

			<div className="mt-8 grid gap-8 lg:grid-cols-3">
				{/* Main content */}
				<div className="space-y-6 lg:col-span-2">
					{/* Appointment Details */}
					<div className="border border-charcoal/10 p-6">
						<div className="flex items-center justify-between">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
								Appointment Details
							</h2>
							<StatusBadge status={appointment.status} />
						</div>

						<div className="mt-5 space-y-4">
							{/* Date & Time */}
							<div className="flex items-start gap-3">
								<svg className="mt-0.5 h-4 w-4 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								<div>
									<p className="text-sm font-medium text-charcoal">
										{formatCustom(appointment.from, 'dddd, MMMM D, YYYY')}
									</p>
									<p className="mt-0.5 text-sm text-warm-gray">
										{formatTime(appointment.from)}
										{' - '}
										{formatTime(appointment.to)}
									</p>
									{durationMin > 0 && (
										<p className="mt-0.5 text-xs text-warm-gray">{formatDuration(durationMin * 60)}</p>
									)}
								</div>
							</div>

							{/* Location */}
							{appointment.location?.title && (
								<div className="flex items-start gap-3">
									<svg className="mt-0.5 h-4 w-4 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										<path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									<div>
										<p className="text-sm font-medium text-charcoal">{appointment.location.title}</p>
										{(appointment.addressLine1 || appointment.city) && (
											<p className="mt-0.5 text-sm text-warm-gray">
												{[appointment.addressLine1, appointment.city, appointment.state, appointment.postalCode].filter(Boolean).join(', ')}
											</p>
										)}
									</div>
								</div>
							)}

							{/* Staff Member */}
							{appointment.staffMember && (
								<div className="flex items-start gap-3">
									<svg className="mt-0.5 h-4 w-4 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									<p className="text-sm font-medium text-charcoal">
										{[appointment.staffMember.firstName, appointment.staffMember.lastName].filter(Boolean).join(' ')}
									</p>
								</div>
							)}

							{/* Attendees */}
							{appointment.numberOfAttendees > 1 && (
								<div className="flex items-start gap-3">
									<svg className="mt-0.5 h-4 w-4 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									<p className="text-sm font-medium text-charcoal">
										{appointment.numberOfAttendees} attendees
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Add-ons */}
					{(() => {
						const addOns = appointment.addOns ?? [];
						if (!addOns.length) return null;
						const currency = appointment.store?.currencyCode ?? 'USD';
						return (
							<div className="border border-charcoal/10 p-6">
								<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
									Add-ons
								</h2>
								<div className="mt-4 divide-y divide-charcoal/5">
									{addOns.map((a, idx) => (
										<div key={a.id ?? `${a.addOnId}-${idx}`} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
											<span className="text-sm font-medium text-charcoal">
												{a.addOn?.title ?? 'Add-on'}
												{(a.quantity ?? 1) > 1 && ` × ${a.quantity}`}
											</span>
											{a.addOn?.price != null && (
												<span className="text-sm text-warm-gray">
													{formatPrice((a.addOn.price ?? 0) * (a.quantity ?? 1), currency)}
												</span>
											)}
										</div>
									))}
								</div>
							</div>
						);
					})()}

					{/* Actions */}
					{(canCancel || canReschedule) && (
						<div className="border border-charcoal/10 p-6">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
								Actions
							</h2>
							<div className="mt-4 flex flex-wrap gap-3">
								{canReschedule && (
									<button
										onClick={() => setModal('reschedule')}
										className="flex items-center gap-2 border border-charcoal/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-cream"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
										</svg>
										Reschedule
									</button>
								)}
								{canCancel && (
									<button
										onClick={() => setModal('cancel')}
										className="flex items-center gap-2 border border-red-200 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-red-600 transition-colors hover:bg-red-50"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
										</svg>
										Cancel Appointment
									</button>
								)}
							</div>
							{appointment.product?.cancelGap && appointment.product.cancelGap > 0 && (
								<p className="mt-3 text-xs text-warm-gray">
									Cancellation must be made at least {formatGap(appointment.product.cancelGap)} before the appointment.
								</p>
							)}
							{appointment.product?.rescheduleGap && appointment.product.rescheduleGap > 0 && (
								<p className="mt-1 text-xs text-warm-gray">
									Rescheduling must be done at least {formatGap(appointment.product.rescheduleGap)} before the appointment.
								</p>
							)}
						</div>
					)}
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Service Info */}
					{appointment.product && (
						<div className="border border-charcoal/10 p-6">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
								Service
							</h2>
							<p className="mt-3 text-sm font-medium text-charcoal">{appointment.product.title}</p>
							{appointment.product.duration && (
								<p className="mt-1 text-xs text-warm-gray">{formatDuration(appointment.product.duration)}</p>
							)}
							{appointment.product.price != null && appointment.product.price > 0 && (
								<p className="mt-2 text-lg font-bold text-charcoal">
									{formatPrice(appointment.product.price, appointment.store?.currencyCode ?? 'USD')}
								</p>
							)}
						</div>
					)}

					{/* Book Again */}
					{appointment.product?.slug && (
						<Link
							href={`/booking/${appointment.product.slug}`}
							className="flex w-full items-center justify-center gap-2 bg-charcoal px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent"
						>
							Book Again
						</Link>
					)}
				</div>
			</div>

			{/* Cancel Modal */}
			{modal === 'cancel' && (
				<CancelModal
					appointmentId={appointment.id}
					serviceName={appointment.product?.title ?? 'Appointment'}
					onClose={() => setModal('none')}
					onCanceled={() => router.push('/account/appointments')}
				/>
			)}

			{/* Reschedule Modal */}
			{modal === 'reschedule' && (
				<RescheduleModal
					appointment={appointment}
					onClose={() => setModal('none')}
					onRescheduled={() => {
						setModal('none');
						fetchAppointment();
					}}
				/>
			)}
		</div>
	);
}

function formatGap(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
	if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
	return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

function StatusBadge({ status }: { status: AppointmentStatusType }) {
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

/* ─── Cancel Modal ─── */

function CancelModal({
	appointmentId,
	serviceName,
	onClose,
	onCanceled,
}: {
	appointmentId: string;
	serviceName: string;
	onClose: () => void;
	onCanceled: () => void;
}) {
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	async function handleCancel() {
		setSubmitting(true);
		setError('');
		try {
			const res = await fetch(`/api/account/appointments/${appointmentId}/cancel`, { method: 'PUT' });
			if (res.ok) {
				onCanceled();
			} else {
				const data = await res.json();
				setError(data.error ?? 'Failed to cancel appointment');
			}
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={onClose}>
			<div className="w-full max-w-md bg-white p-8" onClick={(e) => e.stopPropagation()}>
				<h3 className="font-display text-xl font-semibold text-charcoal">Cancel Appointment</h3>
				<p className="mt-3 text-sm text-warm-gray">
					Are you sure you want to cancel your appointment for <span className="font-medium text-charcoal">{serviceName}</span>? This action cannot be undone.
				</p>

				{error && (
					<div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
						{error}
					</div>
				)}

				<div className="mt-6 flex gap-3">
					<button
						onClick={onClose}
						disabled={submitting}
						className="flex-1 border border-charcoal/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-cream disabled:opacity-50"
					>
						Keep Appointment
					</button>
					<button
						onClick={handleCancel}
						disabled={submitting}
						className="flex-1 bg-red-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-red-700 disabled:opacity-50"
					>
						{submitting ? 'Canceling...' : 'Cancel Appointment'}
					</button>
				</div>
			</div>
		</div>
	);
}

/* ─── Reschedule Modal ─── */


function RescheduleModal({
	appointment,
	onClose,
	onRescheduled,
}: {
	appointment: Appointment;
	onClose: () => void;
	onRescheduled: () => void;
}) {
	const [selectedDate, setSelectedDate] = useState('');
	const [slots, setSlots] = useState<CurrentAvailabilitySlot[]>([]);
	const [selectedSlot, setSelectedSlot] = useState<CurrentAvailabilitySlot | null>(null);
	const [loadingSlots, setLoadingSlots] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');

	const { formatCustom: fmtCustom, formatSlot, formatTime: fmtTime, timezone } = useDateFormatter();
	const productId = appointment.productId;

	// Generate next 30 days
	const dates: string[] = [];
	for (let i = 0; i < 30; i++) {
		const d = new Date();
		d.setDate(d.getDate() + i);
		dates.push(d.toISOString().split('T')[0] ?? '');
	}

	const fetchSlots = useCallback(async (date: string) => {
		setLoadingSlots(true);
		setSlots([]);
		setSelectedSlot(null);
		try {
			const params = new URLSearchParams({ productId, date, timezone });
			if (appointment.staffMemberId) params.set('staffMemberId', appointment.staffMemberId);
			if (appointment.locationId) params.set('locationId', appointment.locationId);

			const res = await fetch(`/api/availability?${params}`);
			if (res.ok) {
				const data = await res.json();
				// Availability response is an array of slot objects
				const availableSlots: CurrentAvailabilitySlot[] = Array.isArray(data) ? data : data?.slots ?? [];
				setSlots(availableSlots);
			}
		} catch {
			// silently fail
		} finally {
			setLoadingSlots(false);
		}
	}, [productId, timezone, appointment.staffMemberId, appointment.locationId]);

	useEffect(() => {
		if (selectedDate) {
			fetchSlots(selectedDate);
		}
	}, [selectedDate, fetchSlots]);

	async function handleReschedule() {
		if (!selectedSlot) return;
		setSubmitting(true);
		setError('');
		try {
			const res = await fetch(`/api/account/appointments/${appointment.id}/reschedule`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					slot: {
						productId,
						fromDate: selectedSlot.fromDate,
						fromTime: selectedSlot.fromTime,
						toDate: selectedSlot.toDate,
						toTime: selectedSlot.toTime,
						staffMemberId: selectedSlot.staffMemberIds?.[0] ?? appointment.staffMemberId ?? null,
						locationId: selectedSlot.locationIds?.[0] ?? appointment.locationId ?? null,
					},
				}),
			});
			if (res.ok) {
				onRescheduled();
			} else {
				const data = await res.json();
				setError(data.error ?? 'Failed to reschedule appointment');
			}
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4" onClick={onClose}>
			<div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-8" onClick={(e) => e.stopPropagation()}>
				<h3 className="font-display text-xl font-semibold text-charcoal">Reschedule Appointment</h3>
				<p className="mt-2 text-sm text-warm-gray">
					Choose a new date and time for your {appointment.product?.title ?? 'appointment'}.
				</p>

				{/* Date Selection */}
				<div className="mt-6">
					<label className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal">
						Select Date
					</label>
					<select
						value={selectedDate}
						onChange={(e) => setSelectedDate(e.target.value)}
						className="mt-2 w-full border border-charcoal/10 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-accent focus:outline-none"
					>
						<option value="">Choose a date...</option>
						{dates.map((date) => (
							<option key={date} value={date}>
								{fmtCustom(date + 'T00:00:00', 'dddd, MMMM D')}
							</option>
						))}
					</select>
				</div>

				{/* Time Slots */}
				{selectedDate && (
					<div className="mt-6">
						<label className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal">
							Available Times
						</label>
						{loadingSlots ? (
							<div className="mt-3 space-y-2">
								{[...Array(4)].map((_, i) => (
									<div key={i} className="h-10 animate-pulse rounded bg-cream" />
								))}
							</div>
						) : slots.length === 0 ? (
							<p className="mt-3 text-sm text-warm-gray">No available times for this date.</p>
						) : (
							<div className="mt-3 grid grid-cols-3 gap-2">
								{slots.map((slot, i) => {
									const isSelected = selectedSlot === slot;
									return (
										<button
											key={i}
											onClick={() => setSelectedSlot(slot)}
											className={`border px-3 py-2 text-xs font-medium transition-colors ${
												isSelected
													? 'border-accent bg-accent text-white'
													: 'border-charcoal/10 text-charcoal hover:border-charcoal/30'
											}`}
										>
											{formatSlot(slot.fromDate, slot.fromTime, 'time')}
										</button>
									);
								})}
							</div>
						)}
					</div>
				)}

				{/* Review Changes */}
				{selectedSlot && (
					<div className="mt-6 border border-accent/20 bg-accent/5 p-4">
						<p className="text-xs font-semibold uppercase tracking-[0.15em] text-charcoal">Review Changes</p>
						<div className="mt-3 space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-warm-gray">Current</span>
								<span className="text-charcoal">
									{fmtCustom(appointment.from, 'MMM D')}
									{' at '}
									{fmtTime(appointment.from)}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-warm-gray">New</span>
								<span className="font-medium text-accent">
									{fmtCustom(selectedSlot.fromDate + 'T00:00:00', 'MMM D')}
									{' at '}
									{formatSlot(selectedSlot.fromDate, selectedSlot.fromTime, 'time')}
								</span>
							</div>
						</div>
					</div>
				)}

				{error && (
					<div className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
						{error}
					</div>
				)}

				<div className="mt-6 flex gap-3">
					<button
						onClick={onClose}
						disabled={submitting}
						className="flex-1 border border-charcoal/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-charcoal transition-colors hover:bg-cream disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						onClick={handleReschedule}
						disabled={!selectedSlot || submitting}
						className="flex-1 bg-charcoal px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:bg-accent disabled:opacity-50"
					>
						{submitting ? 'Rescheduling...' : 'Confirm Reschedule'}
					</button>
				</div>
			</div>
		</div>
	);
}

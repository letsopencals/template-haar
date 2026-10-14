'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import type { AppointmentDetailResponse, CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { Modal } from '@/components/account/modal';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/auth/auth-feedback';
import { DayRibbon } from '@/components/booking/day-ribbon';
import { formatLongDate, formatSlotRange, slotKey, todayIn } from '@/components/booking/slot-time';
import { RescheduleSlots } from '@/components/account/appointment-detail/reschedule-slots';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { useSettings } from '@/contexts/settings-context';
import { onSessionExpired } from '@/lib/session-expired';
import { serviceTitle } from '@/components/account/appointment-utils';

async function availabilityFetcher(url: string): Promise<CurrentAvailabilitySlot[]> {
	const res = await fetch(url);
	const body = await res.json().catch(() => null);
	if (!res.ok) throw new Error(body?.error || 'We couldn’t load times for this day.');
	return Array.isArray(body) ? body : (body?.slots ?? []);
}

const SWR_OPTIONS = { revalidateOnFocus: false, keepPreviousData: false } as const;

/** In the given timezone, the YYYY-MM-DD of a UTC instant. */
function dayIn(iso: string, timezone: string): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date(iso));
}

/**
 * Pick a new day (ribbon) and time (grid) for the same service, stylist and
 * place. The appointment's own slot is excluded from the availability check,
 * and custom-duration bookings keep their length.
 */
export function RescheduleModal({
	appointment,
	open,
	onClose,
	onRescheduled,
}: {
	appointment: AppointmentDetailResponse;
	open: boolean;
	onClose: () => void;
	onRescheduled: (slot: CurrentAvailabilitySlot) => void;
}) {
	const { timezone, formatCustom, formatTime } = useDateFormatter();
	const { timeFormat } = useSettings();

	const initialDay = useMemo(() => {
		const d = dayIn(appointment.from, timezone);
		const today = todayIn(timezone);
		return d < today ? today : d;
	}, [appointment.from, timezone]);

	const [date, setDate] = useState<string>(initialDay);
	const [selected, setSelected] = useState<CurrentAvailabilitySlot | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const key = useMemo(() => {
		if (!open || !date) return null;
		const params = new URLSearchParams({
			productId: appointment.productId,
			date,
			timezone,
			excludeAppointmentId: appointment.id,
		});
		if (appointment.staffMemberId) params.set('staffMemberId', appointment.staffMemberId);
		if (appointment.locationId) params.set('locationId', appointment.locationId);
		// Only custom-length services take a duration; others use the product's own.
		if (appointment.product?.allowCustomDuration) {
			const seconds = Math.round((new Date(appointment.to).getTime() - new Date(appointment.from).getTime()) / 1000);
			if (seconds > 0) params.set('duration', String(seconds));
		}
		return `/api/availability?${params}`;
	}, [open, date, timezone, appointment]);

	const { data: slots, error: slotsError, isLoading } = useSWR(key, availabilityFetcher, SWR_OPTIONS);

	const currentKey = useMemo(() => {
		const d = new Date(appointment.from).toISOString();
		return `${d.slice(0, 10)}T${d.slice(11, 19)}`;
	}, [appointment.from]);

	const pickDate = (d: string) => {
		setDate(d);
		setSelected(null);
		setError(null);
	};

	const submit = async () => {
		if (!selected) return;
		setSubmitting(true);
		setError(null);
		try {
			const res = await fetch(`/api/account/appointments/${appointment.id}/reschedule`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					slot: {
						productId: appointment.productId,
						fromDate: selected.fromDate,
						fromTime: selected.fromTime,
						toDate: selected.toDate,
						toTime: selected.toTime,
						staffMemberId: selected.staffMemberIds?.[0] ?? appointment.staffMemberId ?? null,
						locationId: selected.locationIds?.[0] ?? appointment.locationId ?? null,
					},
				}),
			});
			if (res.status === 401) return onSessionExpired();
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				setError(body?.error ?? 'We couldn’t move your booking. Please pick another time.');
				return;
			}
			onRescheduled(selected);
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal
			open={open}
			onClose={onClose}
			busy={submitting}
			size="lg"
			eyebrow="Nº 02 — Reschedule"
			title={
				<>
					A new <em>time</em>.
				</>
			}
			description={
				<>
					{serviceTitle(appointment)}, currently{' '}
					<span className="text-charcoal">
						{formatCustom(appointment.from, 'ddd D MMM')} at <span className="tabular">{formatTime(appointment.from)}</span>
					</span>
					. Same stylist, same place.
				</>
			}
			footer={
				<>
					<Button variant="outline" onClick={onClose} disabled={submitting}>
						Keep current time
					</Button>
					<Button onClick={submit} disabled={!selected || submitting}>
						{submitting ? 'Moving…' : 'Confirm new time'}
					</Button>
				</>
			}
		>
			<div className="space-y-8">
				<DayRibbon selected={date} onSelect={pickDate} timezone={timezone} label="Choose a new day" />

				<div aria-live="polite">
					<p className="eyebrow mb-4 text-brass">{formatLongDate(date)}</p>
					{slotsError ? (
						<Notice>{slotsError instanceof Error ? slotsError.message : 'We couldn’t load times for this day.'}</Notice>
					) : isLoading || !slots ? (
						<div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4" aria-busy="true">
							{Array.from({ length: 8 }, (_, i) => (
								<div key={i} className="h-12 animate-pulse bg-cream" />
							))}
						</div>
					) : (
						<RescheduleSlots
							slots={slots}
							selectedKey={selected ? slotKey(selected) : null}
							onSelect={(s) => {
								setSelected(s);
								setError(null);
							}}
							timezone={timezone}
							timeFormat={timeFormat}
							currentKey={currentKey}
						/>
					)}
				</div>

				{selected ? (
					<div className="flex items-baseline justify-between gap-4 border-y border-line py-4">
						<span className="eyebrow text-warm-gray">New time</span>
						<span className="text-right text-charcoal">
							<span className="font-display text-lg">{formatLongDate(selected.fromDate === date ? date : selected.fromDate)}</span>
							<span className="tabular ml-3 text-sm text-warm-gray">{formatSlotRange(selected, timezone, timeFormat)}</span>
						</span>
					</div>
				) : null}

				{error ? <Notice>{error}</Notice> : null}
			</div>
		</Modal>
	);
}

import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';

export type DayPart = 'morning' | 'afternoon' | 'evening';
export const DAY_PARTS: DayPart[] = ['morning', 'afternoon', 'evening'];
export const DAY_PART_LABELS: Record<DayPart, string> = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };

function utc(date: string, time: string): Date {
	return new Date(`${date}T${time.length === 5 ? `${time}:00` : time}Z`);
}

/** Slot start (UTC date + time) as a local clock time, honouring the store's 12H/24H setting. */
export function formatSlotTime(date: string, time: string, timezone: string, timeFormat: '12H' | '24H' = '12H'): string {
	return utc(date, time).toLocaleTimeString(timeFormat === '24H' ? 'en-GB' : 'en-US', {
		timeZone: timezone,
		hour: timeFormat === '24H' ? '2-digit' : 'numeric',
		minute: '2-digit',
		hour12: timeFormat !== '24H',
	});
}

export function slotHour(date: string, time: string, timezone: string): number {
	const h = parseInt(utc(date, time).toLocaleTimeString('en-GB', { timeZone: timezone, hour: '2-digit', hour12: false }), 10);
	return Number.isNaN(h) ? 0 : h % 24;
}

export function dayPartOf(hour: number): DayPart {
	if (hour < 12) return 'morning';
	if (hour < 17) return 'afternoon';
	return 'evening';
}

export function slotKey(slot: Pick<CurrentAvailabilitySlot, 'fromDate' | 'fromTime'>): string {
	return `${slot.fromDate}T${slot.fromTime}`;
}

/** "13:00 – 15:00" / "1:00 PM – 3:00 PM" */
export function formatSlotRange(slot: CurrentAvailabilitySlot, timezone: string, timeFormat: '12H' | '24H' = '12H'): string {
	return `${formatSlotTime(slot.fromDate, slot.fromTime, timezone, timeFormat)} – ${formatSlotTime(slot.toDate, slot.toTime, timezone, timeFormat)}`;
}

/** Today (YYYY-MM-DD) in a timezone. */
export function todayIn(timezone: string): string {
	return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date());
}

/** YYYY-MM-DD plus n days (calendar maths in UTC, timezone-agnostic). */
export function plusDays(date: string, n: number): string {
	const d = new Date(`${date}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + n);
	return d.toISOString().slice(0, 10);
}

const LONG_DATE = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
/** "Friday, October 16" for a YYYY-MM-DD. */
export function formatLongDate(date: string): string {
	return LONG_DATE.format(new Date(`${date}T00:00:00Z`));
}

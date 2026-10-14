import type { AppointmentListItemResponse } from '@opencals/storefront-sdk';
import type { CalendarEvent } from '@/lib/calendar';
import { siteConfig } from '@/lib/site-config';

/** The fields the diary and detail views share (list items and the detail response both fit). */
export type DiaryAppointment = Pick<
	AppointmentListItemResponse,
	'id' | 'name' | 'from' | 'to' | 'status' | 'displayAddress' | 'productId' | 'staffMemberId' | 'locationId'
> & {
	product: Pick<
		AppointmentListItemResponse['product'],
		| 'title'
		| 'variantTitle'
		| 'slug'
		| 'duration'
		| 'allowCustomDuration'
		| 'allowCustomerCancel'
		| 'allowCustomerReschedule'
		| 'cancelGap'
		| 'rescheduleGap'
		| 'image'
	>;
	staffMember: Pick<NonNullable<AppointmentListItemResponse['staffMember']>, 'firstName' | 'lastName' | 'image'> | null;
	location: Pick<
		NonNullable<AppointmentListItemResponse['location']>,
		'title' | 'type' | 'link' | 'address' | 'displayAddress'
	> | null;
};

export function serviceTitle(a: Pick<DiaryAppointment, 'product'>): string {
	return a.product?.title ?? 'Appointment';
}

/** "Long hair" style variant label, if the variant is not just the default. */
export function variantLabel(a: Pick<DiaryAppointment, 'product'>): string | null {
	const v = a.product?.variantTitle;
	if (!v || v === a.product?.title || /^default/i.test(v)) return null;
	return v;
}

export function stylistName(a: Pick<DiaryAppointment, 'staffMember'>): string | null {
	const s = a.staffMember;
	if (!s) return null;
	return [s.firstName, s.lastName].filter(Boolean).join(' ') || null;
}

export function placeLabel(a: Pick<DiaryAppointment, 'location' | 'displayAddress'>): string | null {
	const loc = a.location;
	if (loc?.type === 'online') return 'Online';
	return a.displayAddress || loc?.displayAddress || loc?.address || loc?.title || null;
}

/** The booking page for the same variant (the diary's "Book again"). */
export function bookAgainHref(a: Pick<DiaryAppointment, 'product'>): string {
	return a.product?.slug ? `/booking/${a.product.slug}` : '/services';
}

export function isUpcoming(a: Pick<DiaryAppointment, 'from' | 'status'>, now: number): boolean {
	return new Date(a.from).getTime() > now && a.status !== 'canceled' && a.status !== 'completed';
}

export function toCalendarEvent(a: DiaryAppointment): CalendarEvent {
	const stylist = stylistName(a);
	const online = a.location?.type === 'online' ? a.location.link : null;
	return {
		uid: a.id,
		title: `${serviceTitle(a)} at ${siteConfig.name}`,
		start: new Date(a.from).getTime(),
		end: new Date(a.to).getTime(),
		location: online || placeLabel(a) || undefined,
		description: [stylist ? `With ${stylist}` : null, `Booking #${a.name}`].filter(Boolean).join('\n'),
	};
}

/** "in 3 days, 4 h" / "in 5 h 20 min" / "in 12 min" / "now". */
export function formatCountdown(targetMs: number, nowMs: number): string {
	const diff = targetMs - nowMs;
	if (diff <= 60_000) return 'starting now';
	const totalMin = Math.floor(diff / 60_000);
	const days = Math.floor(totalMin / 1440);
	const hours = Math.floor((totalMin % 1440) / 60);
	const minutes = totalMin % 60;
	if (days > 0) {
		const d = `${days} ${days === 1 ? 'day' : 'days'}`;
		return hours > 0 ? `in ${d}, ${hours} h` : `in ${d}`;
	}
	if (hours > 0) return minutes > 0 ? `in ${hours} h ${minutes} min` : `in ${hours} h`;
	return `in ${minutes} min`;
}

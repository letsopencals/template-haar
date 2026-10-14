'use client';

import { useMemo } from 'react';
import moment from 'moment-timezone';
import type { OrderDetailAppointment, OrderDetailResponse } from '@opencals/storefront-sdk';
import { useSettings } from '@/contexts/settings-context';
import { getProductImage } from '@/lib/format';
import { getStaffImageUrl, getStaffName } from '@/lib/staff-utils';
import type { CalendarEvent } from '@/lib/calendar';
import { siteConfig } from '@/lib/site-config';

export interface ConfirmedAppointment {
	id: string;
	title: string;
	option: string | null;
	staffName: string | null;
	staffImage: string | null;
	image: string | null;
	dateLabel: string;
	timeLabel: string;
	/** Short zone label, e.g. "EDT" — times are shown in the salon's timezone. */
	zoneLabel: string;
	locationTitle: string | null;
	address: string | null;
	/** Google Maps search for the address (physical locations only). */
	directionsHref: string | null;
	/** Join link for online locations. */
	onlineLink: string | null;
	status: string;
	attendees: number;
	addOns: { id: string; title: string; quantity: number }[];
	event: CalendarEvent;
}

type Location = NonNullable<OrderDetailAppointment['location']>;

function addressOf(loc: Location | null): string | null {
	if (!loc) return null;
	if (loc.displayAddress) return loc.displayAddress;
	if (loc.address) return loc.address;
	const region = [loc.state, loc.postalCode].filter(Boolean).join(' ');
	const parts = [loc.addressLine1, loc.addressLine2, loc.city, region].filter(Boolean);
	return parts.length ? parts.join(', ') : null;
}

/** Maps the order's appointments into display rows, in the store's timezone. */
export function useConfirmedAppointments(order: OrderDetailResponse | null): ConfirmedAppointment[] {
	const { settings, timeFormat } = useSettings();
	const timezone = settings?.settings?.timezone || moment.tz.guess();

	return useMemo(() => {
		if (!order) return [];
		const time = timeFormat === '24H' ? 'HH:mm' : 'h:mm A';
		return (order.lineItems ?? []).flatMap((li, i) => {
			const a = li.appointment;
			if (!a) return [];
			const from = moment.utc(a.from).tz(timezone);
			const to = moment.utc(a.to).tz(timezone);
			const loc = a.location ?? null;
			const isPhysical = loc?.type === 'physical';
			const address = isPhysical ? addressOf(loc) : null;
			const staffName = a.staffMember ? getStaffName(a.staffMember) || null : null;
			const title = a.product?.title ?? 'Appointment';
			const option = a.product?.variantTitle && a.product.variantTitle !== 'Default Title' ? a.product.variantTitle : null;
			const description = [option, staffName ? `with ${staffName}` : null, loc?.title].filter(Boolean).join(' · ');

			return [
				{
					id: a.id ?? `line-${i}`,
					title,
					option,
					staffName,
					staffImage: a.staffMember ? getStaffImageUrl(a.staffMember) : null,
					image: getProductImage(a.product),
					dateLabel: from.format('dddd D MMMM YYYY'),
					timeLabel: `${from.format(time)}–${to.format(time)}`,
					zoneLabel: from.format('z'),
					locationTitle: loc?.title ?? null,
					address,
					directionsHref: address
						? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
						: null,
					onlineLink: loc?.type === 'online' ? loc.link : null,
					status: a.status,
					attendees: a.numberOfAttendees ?? 1,
					addOns: (li.addOnLineItems ?? []).map((ao, j) => ({
						id: ao.id ?? `${a.id}-addon-${j}`,
						title: ao.addOn?.title ?? 'Add-on',
						quantity: ao.quantity ?? 1,
					})),
					event: {
						uid: a.id ?? `${order.id}-${i}`,
						title: `${title} — ${siteConfig.name}`,
						start: from.valueOf(),
						end: to.valueOf(),
						location: address ?? loc?.link ?? loc?.title ?? undefined,
						description: description || undefined,
					},
				},
			];
		});
	}, [order, timezone, timeFormat]);
}

/** Order-level discount total (service lines + add-ons), as the old page computed it. */
export function orderDiscountTotal(order: OrderDetailResponse): number {
	return (order.lineItems ?? []).reduce((acc, item) => {
		const addOns = (item.addOnLineItems ?? []).reduce((s, ao) => s + (ao.totalDiscount ?? 0), 0);
		return acc + (item.totalDiscount ?? 0) + addOns;
	}, 0);
}

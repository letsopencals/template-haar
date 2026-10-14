'use client';

import { useMemo } from 'react';
import type { CartItem } from '@opencals/storefront-sdk';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { useSettings } from '@/contexts/settings-context';
import { getProductImage } from '@/lib/format';
import { getStaffImageUrl, getStaffName } from '@/lib/staff-utils';
import type { CartWithDiscounts } from '@/types/discount';

export interface CartAddOnLine {
	id: string;
	title: string;
	quantity: number;
	/** Duration-multiplied add-ons scale with the appointment length — no qty controls. */
	durationMultiplied: boolean;
	atMax: boolean;
	price: number;
}

/** Display model for one appointment in the cart (drawer card + checkout stack). */
export interface CartLine {
	id: string;
	title: string;
	option: string | null;
	image: string | null;
	staffName: string | null;
	staffImage: string | null;
	locationTitle: string | null;
	from: string | null;
	to: string | null;
	/** Base service price for this line, before discounts. */
	price: number;
	/** Base service price after line discounts (equals `price` when none apply). */
	discountedPrice: number;
	addOns: CartAddOnLine[];
}

export function toCartLine(item: CartItem): CartLine {
	const appt = item.appointment;
	const product = appt?.product;
	const staff = appt?.staffMember;
	const option = product?.variantTitle?.trim();
	return {
		id: item.id,
		title: product?.title ?? 'Service',
		option: option ? option : null,
		image: getProductImage(product),
		staffName: staff ? getStaffName(staff) || null : null,
		staffImage: staff ? getStaffImageUrl(staff) : null,
		locationTitle: appt?.location?.title ?? null,
		from: appt?.from ?? null,
		to: appt?.to ?? null,
		price: item.originalSubtotal ?? item.originalUnitPrice ?? 0,
		discountedPrice: item.discountedSubtotal ?? item.originalSubtotal ?? item.originalUnitPrice ?? 0,
		addOns: (item.addOnItems ?? []).map((aoi) => {
			const durationMultiplied = aoi.addOn?.durationMultiplied ?? false;
			return {
				id: aoi.id,
				title: aoi.addOn?.title ?? 'Add-on',
				quantity: aoi.quantity,
				durationMultiplied,
				atMax: !durationMultiplied && aoi.addOn?.maxQuantity != null && aoi.quantity >= aoi.addOn.maxQuantity,
				price: aoi.discountedSubtotal,
			};
		}),
	};
}

export function useCartLines(cart: CartWithDiscounts | null): CartLine[] {
	return useMemo(() => (cart?.items ?? []).map((i) => toCartLine(i as CartItem)), [cart]);
}

/** Pre-discount subtotal of every service + add-on line. */
export function cartSubtotal(cart: CartWithDiscounts | null): number {
	return (cart?.items ?? []).reduce((sum, item) => {
		const addOns = (item.addOnItems ?? []).reduce((a, ao) => a + (ao.originalSubtotal ?? 0), 0);
		return sum + (item.originalSubtotal ?? item.originalUnitPrice ?? 0) + addOns;
	}, 0);
}

/**
 * Date + time formatters for appointment cards, in the visitor's chosen
 * timezone (footer selector) and the store's 12/24h preference.
 */
export function useAppointmentFormat() {
	const { formatCustom } = useDateFormatter();
	const { timeFormat } = useSettings();
	const timePattern = timeFormat === '24H' ? 'HH:mm' : 'h:mm A';

	const date = (iso: string | null) => (iso ? formatCustom(iso, 'ddd D MMM') : '');
	const time = (from: string | null, to: string | null) =>
		from ? `${formatCustom(from, timePattern)}${to ? `–${formatCustom(to, timePattern)}` : ''}` : '';
	return { date, time };
}

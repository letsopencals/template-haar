'use client';

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import type { AddOnListItemResponse as AddOn, ProductListVariant } from '@opencals/storefront-sdk';
import { computeAddOnLineTotal } from '@/lib/format';
import { fetcher } from '@/lib/fetcher';

interface UseBookingAddOnsOptions {
	activeVariant: ProductListVariant | null;
	locationId: string | null;
	staffMemberId: string | null;
	bookedDurationUnits: number;
}

interface UseBookingAddOnsResult {
	availableAddOns: AddOn[];
	addOnsLoading: boolean;
	selectedAddOns: Map<string, number>;
	addOnsTotal: number;
	updateQuantity: (addOnId: string, quantity: number) => void;
	resetSelection: () => void;
}

export function useBookingAddOns(options: UseBookingAddOnsOptions): UseBookingAddOnsResult {
	const { activeVariant, locationId, staffMemberId, bookedDurationUnits } = options;

	const [selectedAddOns, setSelectedAddOns] = useState<Map<string, number>>(new Map());

	// SWR keyed on variant + location + staff; dedupes and cancels stale responses.
	const key = activeVariant?.slug
		? (() => {
				const params = new URLSearchParams();
				if (locationId) params.set('locationId', locationId);
				if (staffMemberId) params.set('staffMemberId', staffMemberId);
				const qs = params.toString() ? `?${params}` : '';
				return `/api/products/${activeVariant.slug}/add-ons${qs}`;
			})()
		: null;

	const { data, isLoading } = useSWR<AddOn[]>(key, fetcher, {
		revalidateOnFocus: false,
		onSuccess: (fetched) => {
			// Drop any selected add-ons that are no longer offered.
			const validIds = new Set((fetched ?? []).map((a) => a.id));
			setSelectedAddOns((prev) => {
				const next = new Map(prev);
				let mutated = false;
				for (const id of next.keys()) {
					if (!validIds.has(id)) {
						next.delete(id);
						mutated = true;
					}
				}
				return mutated ? next : prev;
			});
		},
	});

	const availableAddOns = useMemo(() => (Array.isArray(data) ? data : []), [data]);

	const addOnsTotal = useMemo(() => {
		let total = 0;
		for (const [addOnId, qty] of selectedAddOns.entries()) {
			const addOn = availableAddOns.find((a) => a.id === addOnId);
			if (!addOn) continue;
			total += computeAddOnLineTotal(addOn, qty, bookedDurationUnits);
		}
		return total;
	}, [selectedAddOns, availableAddOns, bookedDurationUnits]);

	const updateQuantity = useCallback((addOnId: string, quantity: number) => {
		setSelectedAddOns((prev) => {
			const next = new Map(prev);
			if (quantity <= 0) next.delete(addOnId);
			else next.set(addOnId, quantity);
			return next;
		});
	}, []);

	const resetSelection = useCallback(() => {
		setSelectedAddOns(new Map());
	}, []);

	return {
		availableAddOns,
		addOnsLoading: !!key && isLoading,
		selectedAddOns,
		addOnsTotal,
		updateQuantity,
		resetSelection,
	};
}

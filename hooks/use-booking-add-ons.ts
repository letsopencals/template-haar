'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AddOnListItemResponse as AddOn, ProductListVariant } from '@opencals/storefront-sdk';
import { computeAddOnLineTotal } from '@/lib/format';

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

	const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([]);
	const [addOnsLoading, setAddOnsLoading] = useState(false);
	const [selectedAddOns, setSelectedAddOns] = useState<Map<string, number>>(new Map());
	const requestId = useRef(0);

	useEffect(() => {
		if (!activeVariant?.slug) {
			setAvailableAddOns([]);
			return;
		}

		const currentId = ++requestId.current;
		setAddOnsLoading(true);

		const params = new URLSearchParams();
		if (locationId) params.set('locationId', locationId);
		if (staffMemberId) params.set('staffMemberId', staffMemberId);
		const qs = params.toString() ? `?${params}` : '';

		fetch(`/api/products/${activeVariant.slug}/add-ons${qs}`)
			.then((res) => (res.ok ? res.json() : []))
			.then((data: AddOn[]) => {
				if (currentId !== requestId.current) return;
				const addOns = Array.isArray(data) ? data : [];
				setAvailableAddOns(addOns);
				setSelectedAddOns((prev) => {
					const validIds = new Set(addOns.map((a) => a.id));
					const next = new Map(prev);
					let mutated = false;
					for (const key of next.keys()) {
						if (!validIds.has(key)) {
							next.delete(key);
							mutated = true;
						}
					}
					return mutated ? next : prev;
				});
			})
			.catch(() => {
				if (currentId === requestId.current) setAvailableAddOns([]);
			})
			.finally(() => {
				if (currentId === requestId.current) setAddOnsLoading(false);
			});
	}, [activeVariant?.slug, locationId, staffMemberId]);

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
		addOnsLoading,
		selectedAddOns,
		addOnsTotal,
		updateQuantity,
		resetSelection,
	};
}

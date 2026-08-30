'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CurrentAvailabilitySlot, ProductListVariant } from '@opencals/storefront-sdk';

interface UseAvailabilityOptions {
	activeVariant: ProductListVariant | null;
	timezone: string;
	staffMemberId: string | null;
	locationId: string | null;
}

interface UseAvailabilityResult {
	selectedDate: string | null;
	setSelectedDate: (date: string | null) => void;
	slots: CurrentAvailabilitySlot[];
	slotsLoading: boolean;
	selectedSlot: CurrentAvailabilitySlot | null;
	selectSlot: (slot: CurrentAvailabilitySlot) => void;
	resetSlot: () => void;
}

export function useAvailability(options: UseAvailabilityOptions): UseAvailabilityResult {
	const { activeVariant, timezone, staffMemberId, locationId } = options;

	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [slots, setSlots] = useState<CurrentAvailabilitySlot[]>([]);
	const [slotsLoading, setSlotsLoading] = useState(false);
	const [selectedSlot, setSelectedSlot] = useState<CurrentAvailabilitySlot | null>(null);

	useEffect(() => {
		if (!activeVariant || !selectedDate) return;

		const controller = new AbortController();
		setSlotsLoading(true);
		setSelectedSlot(null);

		const params = new URLSearchParams({ date: selectedDate, timezone });
		if (staffMemberId) params.set('staffMemberId', staffMemberId);
		if (locationId) params.set('locationId', locationId);

		fetch(`/api/products/${activeVariant.slug}/availability?${params}`, { signal: controller.signal })
			.then((res) => {
				if (!res.ok) throw new Error('Failed');
				return res.json();
			})
			.then((data) => {
				setSlots(Array.isArray(data) ? data : []);
			})
			.catch((err) => {
				if (err instanceof DOMException && err.name === 'AbortError') return;
				setSlots([]);
			})
			.finally(() => {
				setSlotsLoading(false);
			});

		return () => controller.abort();
	}, [activeVariant, selectedDate, timezone, staffMemberId, locationId]);

	const selectSlot = useCallback((slot: CurrentAvailabilitySlot) => {
		setSelectedSlot(slot);
	}, []);

	const resetSlot = useCallback(() => {
		setSelectedSlot(null);
	}, []);

	const handleSetDate = useCallback((date: string | null) => {
		setSelectedDate(date);
		setSelectedSlot(null);
	}, []);

	return {
		selectedDate,
		setSelectedDate: handleSetDate,
		slots,
		slotsLoading,
		selectedSlot,
		selectSlot,
		resetSlot,
	};
}

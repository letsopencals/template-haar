'use client';

import { useCallback, useState } from 'react';
import useSWR from 'swr';
import type { CurrentAvailabilitySlot, ProductListVariant } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';

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
	const [selectedSlot, setSelectedSlot] = useState<CurrentAvailabilitySlot | null>(null);

	// SWR handles request dedup + cancellation of stale responses; the key is
	// null until a date is picked, so nothing fetches on mount.
	const key =
		activeVariant && selectedDate
			? (() => {
					const params = new URLSearchParams({ date: selectedDate, timezone });
					if (staffMemberId) params.set('staffMemberId', staffMemberId);
					if (locationId) params.set('locationId', locationId);
					return `/api/products/${activeVariant.slug}/availability?${params}`;
				})()
			: null;

	const { data, isLoading } = useSWR<CurrentAvailabilitySlot[]>(key, fetcher, {
		revalidateOnFocus: false,
		onSuccess: () => setSelectedSlot(null),
	});

	const slots = Array.isArray(data) ? data : [];

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
		slotsLoading: !!key && isLoading,
		selectedSlot,
		selectSlot,
		resetSlot,
	};
}

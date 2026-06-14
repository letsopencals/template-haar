'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import type { BookingStep } from '@/lib/booking-constants';
import { useCart } from '@/contexts/cart-context';
import { useLocation } from '@/contexts/location-context';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { useProductData } from '@/hooks/use-product-data';
import { useAvailability } from '@/hooks/use-availability';
import { useBookingAddOns } from '@/hooks/use-booking-add-ons';

export function useBookingFlow(slug: string) {
	const { cartId, setCart } = useCart();
	const { selectedLocationId: globalLocationId } = useLocation();
	const { formatCustom, formatTimeRange, timezone } = useDateFormatter();

	const productData = useProductData(slug);
	const { product, activeVariant, variants, hasVariants, selectedVariantId, setSelectedVariantId } = productData;

	// Staff & location state
	const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
	const [confirmedStaffId, setConfirmedStaffId] = useState<string | null>(null);
	const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
	const [attendees, setAttendees] = useState(1);

	// Booking submission state
	const [booking, setBooking] = useState(false);
	const [bookingSuccess, setBookingSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [step, setStep] = useState<BookingStep>('date');

	const finalStaffId = selectedStaffId ?? confirmedStaffId;

	// Staff filtered by selected location
	const staffForLocation = useMemo(() => {
		return (activeVariant?.staffMembers ?? []).filter((staff) => {
			if (!selectedLocationId) return true;
			const staffLocations = staff.locations;
			if (!staffLocations) return true;
			return staffLocations.some((l) => l.id === selectedLocationId);
		});
	}, [activeVariant?.staffMembers, selectedLocationId]);

	const needsStaffSelection = staffForLocation.length > 0 && !finalStaffId;

	// Availability
	const availability = useAvailability({
		activeVariant,
		timezone,
		staffMemberId: selectedStaffId,
		locationId: selectedLocationId,
	});

	// Duration units for add-on pricing
	const bookedDurationUnits = useMemo(() => {
		const baseDuration = activeVariant?.duration ?? product?.duration;
		if (!baseDuration || !availability.selectedSlot) return 1;
		const slot = availability.selectedSlot;
		const from = new Date(`${slot.fromDate}T${slot.fromTime}Z`);
		const to = new Date(`${slot.toDate}T${slot.toTime}Z`);
		const durationSeconds = (to.getTime() - from.getTime()) / 1000;
		return Math.max(1, Math.ceil(durationSeconds / baseDuration));
	}, [activeVariant?.duration, product?.duration, availability.selectedSlot]);

	// Add-ons
	const addOns = useBookingAddOns({
		activeVariant,
		locationId: selectedLocationId,
		staffMemberId: finalStaffId,
		bookedDurationUnits,
	});

	// Reset state when variant changes
	useEffect(() => {
		setSelectedStaffId(null);
		setConfirmedStaffId(null);
		availability.setSelectedDate(null);
		setBookingSuccess(false);
		setStep('date');
		addOns.resetSelection();

		const variantLocations = activeVariant?.locations ?? [];
		const contextMatch = variantLocations.find((l) => l.id === globalLocationId);
		setSelectedLocationId(contextMatch?.id ?? variantLocations[0]?.id ?? null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedVariantId, globalLocationId]);

	// Step transitions
	const handleDateSelect = useCallback((date: string | null) => {
		availability.setSelectedDate(date);
		if (date) setStep('time');
	}, [availability]);

	const handleSlotSelect = useCallback((slot: CurrentAvailabilitySlot) => {
		availability.selectSlot(slot);
		setConfirmedStaffId(null);
		setStep('add-ons');
	}, [availability]);

	// Auto-skip add-ons if none available
	useEffect(() => {
		if (step === 'add-ons' && !addOns.addOnsLoading && addOns.availableAddOns.length === 0) {
			setStep('confirm');
		}
	}, [step, addOns.addOnsLoading, addOns.availableAddOns.length]);

	// Booking submission
	const handleBooking = useCallback(async () => {
		if (!activeVariant || !availability.selectedSlot) return;

		setBooking(true);
		setError(null);

		try {
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (cartId) headers['X-Cart-Id'] = cartId;

			const slot = availability.selectedSlot;
			const res = await fetch('/api/book', {
				method: 'POST',
				headers,
				body: JSON.stringify({
					slot: {
						productId: activeVariant.id,
						fromDate: slot.fromDate,
						fromTime: slot.fromTime,
						toDate: slot.toDate,
						toTime: slot.toTime,
						staffMemberId: finalStaffId ?? slot.staffMemberIds?.[0] ?? null,
						locationId: selectedLocationId ?? slot.locationIds?.[0] ?? null,
					},
					numberOfAttendees: attendees,
					addOns: Array.from(addOns.selectedAddOns.entries()).map(([addOnId, quantity]) => {
						const addOn = addOns.availableAddOns.find((a) => a.id === addOnId);
						return addOn?.durationMultiplied ? { addOnId } : { addOnId, quantity };
					}),
				}),
			});

			if (!res.ok) {
				const data = await res.json().catch(() => null);
				throw new Error(data?.error || 'Booking failed');
			}

			const data = await res.json();
			if (data.cart) setCart(data.cart);
			setBookingSuccess(true);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
			setBooking(false);
		}
	}, [activeVariant, availability.selectedSlot, attendees, cartId, setCart, finalStaffId, selectedLocationId, addOns]);

	return {
		// Product
		product,
		activeVariant,
		variants,
		hasVariants,
		selectedVariantId,
		setSelectedVariantId,
		loading: productData.loading,
		error: error ?? productData.error,
		setError,

		// Staff & location
		selectedStaffId,
		setSelectedStaffId,
		confirmedStaffId,
		setConfirmedStaffId,
		selectedLocationId,
		setSelectedLocationId,
		finalStaffId,
		staffForLocation,
		needsStaffSelection,

		// Availability
		selectedDate: availability.selectedDate,
		setSelectedDate: handleDateSelect,
		slots: availability.slots,
		slotsLoading: availability.slotsLoading,
		selectedSlot: availability.selectedSlot,
		handleSlotSelect,

		// Attendees
		attendees,
		setAttendees,

		// Add-ons
		availableAddOns: addOns.availableAddOns,
		addOnsLoading: addOns.addOnsLoading,
		selectedAddOns: addOns.selectedAddOns,
		addOnsTotal: addOns.addOnsTotal,
		updateAddOnQuantity: addOns.updateQuantity,
		bookedDurationUnits,

		// Flow
		step,
		setStep,
		booking,
		bookingSuccess,
		handleBooking,

		// Formatting
		formatCustom,
		formatTimeRange,
		timezone,
	};
}

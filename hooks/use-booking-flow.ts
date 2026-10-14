'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
	CurrentAvailabilitySlot,
	ProductListItemResponse,
	ProductListVariant,
	ProductListVariantStaffMember as StaffMember,
} from '@opencals/storefront-sdk';
import type { BookingSectionIndex } from '@/lib/booking-constants';
import { useCart } from '@/contexts/cart-context';
import { useLocation } from '@/contexts/location-context';
import { useTimezone } from '@/contexts/timezone-context';
import { useProductData } from '@/hooks/use-product-data';
import { useAvailability } from '@/hooks/use-availability';
import { useBookingAddOns } from '@/hooks/use-booking-add-ons';

/** Values pre-filled from the URL (`?date=YYYY-MM-DD&staff=<id>&location=<id>`). */
export interface BookingDeepLink {
	date?: string | null;
	staffId?: string | null;
	locationId?: string | null;
}

type Locatable = { locations?: Array<{ id: string }> | null };

/** Staff without a location list work everywhere (same rule as before the redesign). */
function worksAt(staff: Locatable, locationId: string | null): boolean {
	if (!locationId || !staff.locations) return true;
	return staff.locations.some((l) => l.id === locationId);
}

function staffForSlot(staff: StaffMember[], slot: CurrentAvailabilitySlot | null): StaffMember[] {
	if (!slot) return [];
	const free = new Set(slot.staffMemberIds ?? []);
	return staff.filter((s) => free.has(s.id));
}

/** Where to book, in priority: explicit choice → saved salon (if the stylist works there) → the stylist's salon → saved salon → first. */
function resolveLocation(
	variant: ProductListVariant | null,
	chosenId: string | null,
	globalId: string | null,
	staff: StaffMember | null,
): string | null {
	const locations = variant?.locations ?? [];
	const ids = new Set(locations.map((l) => l.id));
	if (chosenId && ids.has(chosenId)) return chosenId;
	const staffIds = staff?.locations?.map((l) => l.id).filter((id) => ids.has(id)) ?? null;
	if (globalId && ids.has(globalId) && (!staffIds || staffIds.includes(globalId))) return globalId;
	if (staffIds?.length) return staffIds[0]!;
	if (globalId && ids.has(globalId)) return globalId;
	return locations[0]?.id ?? null;
}

/**
 * Thin orchestrator for the consultation-card composer. Composes the product,
 * availability and add-on hooks; owns the selections, the section the visitor
 * has reached, and the add-to-cart submission. Selections are derived where
 * possible (location, the concrete stylist), so changing one never needs an
 * effect to repair another.
 */
export function useBookingFlow(
	slug: string,
	initialProduct: ProductListItemResponse | null = null,
	deepLink: BookingDeepLink = {},
) {
	const { cartId, setCart } = useCart();
	const { selectedLocationId: globalLocationId } = useLocation();
	const { timezone } = useTimezone();

	// The URL slug is a variant slug: select that variant, not just the first one.
	const productData = useProductData(slug, initialProduct, slug);
	const { product, activeVariant, variants, hasVariants, selectedVariantId, setSelectedVariantId } = productData;

	const allStaff = useMemo(() => activeVariant?.staffMembers ?? [], [activeVariant]);

	const deepStaffValid = !!deepLink.staffId && allStaff.some((s) => s.id === deepLink.staffId);
	const [chosenLocationId, setChosenLocationId] = useState<string | null>(deepLink.locationId ?? null);
	/** null = "Any stylist". */
	const [chosenStaffId, setChosenStaffId] = useState<string | null>(deepStaffValid ? deepLink.staffId! : null);
	/** The visitor has answered the stylist question (a face or "Any"). */
	const [stylistChosen, setStylistChosen] = useState(deepStaffValid);
	/** In "Any" mode: the face picked for the chosen slot. */
	const [confirmedStaffId, setConfirmedStaffId] = useState<string | null>(null);
	const [attendees, setAttendees] = useState(1);

	const [booking, setBooking] = useState(false);
	const [bookingSuccess, setBookingSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Location → staff → availability, all derived.
	const chosenStaff = allStaff.find((s) => s.id === chosenStaffId) ?? null;
	const selectedLocationId = resolveLocation(activeVariant, chosenLocationId, globalLocationId, chosenStaff);
	const selectedLocation = activeVariant?.locations?.find((l) => l.id === selectedLocationId) ?? null;

	const staffForLocation = useMemo(
		() => allStaff.filter((s) => worksAt(s, selectedLocationId)),
		[allStaff, selectedLocationId],
	);
	const selectedStaffId = staffForLocation.some((s) => s.id === chosenStaffId) ? chosenStaffId : null;

	const availability = useAvailability({
		activeVariant,
		timezone,
		staffMemberId: selectedStaffId,
		locationId: selectedLocationId,
		initialDate: deepLink.date ?? null,
	});
	const { selectedSlot } = availability;

	// "Any stylist": who is free at the chosen time. One face → chosen for you.
	const slotStaff = useMemo(() => staffForSlot(staffForLocation, selectedSlot), [staffForLocation, selectedSlot]);
	const confirmedValid = confirmedStaffId && slotStaff.some((s) => s.id === confirmedStaffId) ? confirmedStaffId : null;
	const autoConfirmed = slotStaff.length === 1 ? slotStaff[0]!.id : null;
	// A slot whose free staff aren't listed on the variant still books (same fallback as before).
	const unlistedFallback = selectedSlot && slotStaff.length === 0 ? (selectedSlot.staffMemberIds?.[0] ?? null) : null;
	const finalStaffId = selectedStaffId ?? confirmedValid ?? autoConfirmed ?? unlistedFallback;
	const finalStaff = staffForLocation.find((s) => s.id === finalStaffId) ?? allStaff.find((s) => s.id === finalStaffId) ?? null;
	const needsStaffSelection = staffForLocation.length > 0 && !finalStaffId;

	// Duration units for add-on pricing (durationMultiplied add-ons: price × units).
	const bookedDurationUnits = useMemo(() => {
		const baseDuration = activeVariant?.duration ?? product?.duration;
		if (!baseDuration || !selectedSlot) return 1;
		const from = new Date(`${selectedSlot.fromDate}T${selectedSlot.fromTime}Z`);
		const to = new Date(`${selectedSlot.toDate}T${selectedSlot.toTime}Z`);
		const durationSeconds = (to.getTime() - from.getTime()) / 1000;
		return Math.max(1, Math.ceil(durationSeconds / baseDuration));
	}, [activeVariant?.duration, product?.duration, selectedSlot]);

	const addOns = useBookingAddOns({
		activeVariant,
		locationId: selectedLocationId,
		staffMemberId: finalStaffId,
		bookedDurationUnits,
	});

	const maxAttendees = activeVariant?.maxAttendees ?? product?.maxAttendees ?? 1;
	const seatsLeft = Math.max(1, maxAttendees - (selectedSlot?.attendees ?? 0));
	const attendeeCount = Math.min(attendees, seatsLeft);
	const basePrice = activeVariant?.price ?? product?.price ?? 0;
	const total = basePrice * attendeeCount + addOns.addOnsTotal;

	// ---------------------------------------------------------------- Sections
	const timeComplete = !!selectedSlot && !needsStaffSelection;

	// Deep links unlock what they answer: a salon / stylist skips "Your service", a stylist skips "Your stylist".
	const [reached, setReached] = useState<BookingSectionIndex>(() => {
		const locations = activeVariant?.locations ?? [];
		const serviceDone = !!deepLink.locationId || deepStaffValid || locations.length <= 1;
		if (!serviceDone) return 0;
		return deepStaffValid || allStaff.length === 0 ? 2 : 1;
	});

	/** Re-open a completed section; the ones after it lock until it's answered again. */
	const openSection = useCallback((index: BookingSectionIndex) => setReached(index), []);

	const continueFromService = useCallback(() => {
		setReached(!stylistChosen && allStaff.length > 0 ? 1 : timeComplete ? 3 : 2);
	}, [stylistChosen, allStaff.length, timeComplete]);

	// ---------------------------------------------------------------- Handlers
	// Any change after the card was reserved flips it back to the front.
	const { setSelectedDate, selectSlot, resetSlot } = availability;
	const { resetSelection } = addOns;

	const selectVariant = useCallback(
		(id: string) => {
			setSelectedVariantId(id);
			resetSlot();
			setConfirmedStaffId(null);
			resetSelection();
			setBookingSuccess(false);
			const next = variants.find((v) => v.id === id);
			if (chosenStaffId && !next?.staffMembers?.some((s) => s.id === chosenStaffId)) {
				setChosenStaffId(null);
				setStylistChosen(false);
			}
		},
		[setSelectedVariantId, resetSlot, resetSelection, variants, chosenStaffId],
	);

	const selectLocation = useCallback(
		(id: string) => {
			setChosenLocationId(id);
			resetSlot();
			setConfirmedStaffId(null);
			setBookingSuccess(false);
		},
		[resetSlot],
	);

	const selectStaff = useCallback(
		(id: string | null) => {
			setChosenStaffId(id);
			setStylistChosen(true);
			resetSlot();
			setConfirmedStaffId(null);
			setBookingSuccess(false);
			setReached(2);
		},
		[resetSlot],
	);

	const selectDate = useCallback(
		(date: string | null) => {
			setSelectedDate(date);
			setConfirmedStaffId(null);
			setBookingSuccess(false);
		},
		[setSelectedDate],
	);

	const selectTimeSlot = useCallback(
		(slot: CurrentAvailabilitySlot) => {
			selectSlot(slot);
			setConfirmedStaffId(null);
			setBookingSuccess(false);
			// A named stylist, or only one face free → the card is ready for finishing touches.
			if (selectedStaffId || staffForSlot(staffForLocation, slot).length <= 1) setReached(3);
		},
		[selectSlot, selectedStaffId, staffForLocation],
	);

	const confirmStaff = useCallback((id: string) => {
		setConfirmedStaffId(id);
		setBookingSuccess(false);
		setReached(3);
	}, []);

	const updateAddOnQuantity = useCallback(
		(addOnId: string, quantity: number) => {
			addOns.updateQuantity(addOnId, quantity);
			setBookingSuccess(false);
		},
		[addOns],
	);

	const changeAttendees = useCallback(
		(n: number) => {
			setAttendees(Math.max(1, Math.min(seatsLeft, n)));
			setBookingSuccess(false);
		},
		[seatsLeft],
	);

	const resetBooking = useCallback(() => setBookingSuccess(false), []);

	// ---------------------------------------------------------- Missing pieces
	const missing: string[] = [];
	if (!activeVariant) missing.push('your option');
	if ((activeVariant?.locations?.length ?? 0) > 0 && !selectedLocationId) missing.push('a salon');
	if (allStaff.length > 0 && !stylistChosen) missing.push('a stylist');
	if (!availability.selectedDate) missing.push('a day');
	else if (!selectedSlot) missing.push('a time');
	else if (needsStaffSelection) missing.push('who will see you');
	const canReserve = missing.length === 0 && !booking;

	// ---------------------------------------------------------- Add to cart
	const handleBooking = useCallback(async (): Promise<boolean> => {
		if (!activeVariant || !selectedSlot || needsStaffSelection) return false;

		setBooking(true);
		setError(null);

		try {
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (cartId) headers['X-Cart-Id'] = cartId;

			const slot = selectedSlot;
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
					numberOfAttendees: attendeeCount,
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
			return true;
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
			return false;
		} finally {
			setBooking(false);
		}
	}, [activeVariant, selectedSlot, needsStaffSelection, attendeeCount, cartId, setCart, finalStaffId, selectedLocationId, addOns]);

	return {
		// Product
		product,
		activeVariant,
		variants,
		hasVariants,
		selectedVariantId,
		selectVariant,
		loading: productData.loading,
		productError: productData.error,
		error,
		setError,

		// Location
		selectedLocationId,
		selectedLocation,
		selectLocation,

		// Stylist
		allStaff,
		staffForLocation,
		selectedStaffId,
		stylistChosen,
		selectStaff,
		slotStaff,
		confirmedStaffId: confirmedValid ?? autoConfirmed,
		confirmStaff,
		finalStaffId,
		finalStaff,
		needsStaffSelection,

		// Day & time
		selectedDate: availability.selectedDate,
		selectDate,
		availableDates: availability.availableDates,
		slots: availability.slots,
		slotsLoading: availability.slotsLoading,
		selectedSlot,
		selectTimeSlot,

		// Finishing touches
		maxAttendees,
		seatsLeft,
		attendees: attendeeCount,
		changeAttendees,
		availableAddOns: addOns.availableAddOns,
		addOnsLoading: addOns.addOnsLoading,
		selectedAddOns: addOns.selectedAddOns,
		addOnsTotal: addOns.addOnsTotal,
		updateAddOnQuantity,
		bookedDurationUnits,

		// Totals
		basePrice,
		total,

		// Sections
		reached,
		openSection,
		continueFromService,
		timeComplete,

		// Submission
		missing,
		canReserve,
		booking,
		bookingSuccess,
		handleBooking,
		resetBooking,

		timezone,
	};
}

export type BookingFlow = ReturnType<typeof useBookingFlow>;

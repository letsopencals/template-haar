'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Product, CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { formatDuration, formatPrice, getProductImage } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { DatePicker } from '@/components/booking/date-picker';
import { TimeSlots } from '@/components/booking/time-slots';
import { StaffSelector } from '@/components/booking/staff-selector';
import { LocationSelector } from '@/components/booking/location-selector';
import { useCart } from '@/contexts/cart-context';
import { useLocation } from '@/contexts/location-context';

type BookingStep = 'date' | 'time' | 'confirm';

export default function BookingPage() {
	const params = useParams();
	const slug = params.slug as string;
	const { cartId, setCart } = useCart();
	const { selectedLocationId: globalLocationId } = useLocation();

	const [product, setProduct] = useState<Product | null>(null);
	const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Booking state
	const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null); // Top-level filter (triggers re-fetch)
	const [confirmedStaffId, setConfirmedStaffId] = useState<string | null>(null); // Slot-level pick (no re-fetch)
	const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [slots, setSlots] = useState<CurrentAvailabilitySlot[]>([]);
	const [slotsLoading, setSlotsLoading] = useState(false);
	const [selectedSlot, setSelectedSlot] = useState<CurrentAvailabilitySlot | null>(null);
	const [attendees, setAttendees] = useState(1);
	const [booking, setBooking] = useState(false);
	const [bookingSuccess, setBookingSuccess] = useState(false);
	const [step, setStep] = useState<BookingStep>('date');

	const { formatCustom, formatTimeRange, timezone } = useDateFormatter();

	// Compute active variant (the variant being booked)
	const variants = product?.variants ?? [];
	const hasVariants = variants.length > 0;
	const activeVariant: Product | null = hasVariants
		? variants.find((v) => v.id === selectedVariantId) ?? variants[0] ?? null
		: product;

	// The final staff ID used for booking: either top-level selection or slot-level confirmation
	const finalStaffId = selectedStaffId ?? confirmedStaffId;

	// Staff members filtered by selected location
	const staffForLocation = (activeVariant?.staffMembers ?? []).filter((staff) => {
		if (!selectedLocationId) return true;
		// Staff member has a locations relation — filter to those at the selected location
		const staffLocations = (staff as { locations?: { id: string }[] }).locations;
		if (!staffLocations) return true; // If no locations relation, show all
		return staffLocations.some((l) => l.id === selectedLocationId);
	});

	// Whether staff selection is required before booking
	const needsStaffSelection = staffForLocation.length > 0 && !finalStaffId;

	// Reset booking state when variant changes, auto-select location
	useEffect(() => {
		setSelectedStaffId(null);
		setConfirmedStaffId(null);
		setSelectedDate(null);
		setSelectedSlot(null);
		setSlots([]);
		setBookingSuccess(false);
		setStep('date');

		// Auto-select location: prefer global context, else first available
		const variantLocations = activeVariant?.locations ?? [];
		const contextMatch = variantLocations.find((l) => l.id === globalLocationId);
		setSelectedLocationId(contextMatch?.id ?? variantLocations[0]?.id ?? null);
	}, [selectedVariantId, activeVariant, globalLocationId]);

	// Fetch product
	useEffect(() => {
		async function fetchProduct() {
			try {
				const res = await fetch(`/api/products/${slug}`);
				if (!res.ok) throw new Error('Not found');
				const data = await res.json();
				setProduct(data);
			} catch {
				setError('Service not found.');
			} finally {
				setLoading(false);
			}
		}
		fetchProduct();
	}, [slug]);

	// Fetch availability when date or filters change
	useEffect(() => {
		if (!activeVariant || !selectedDate) return;

		const variantSlug = activeVariant.slug;
		setSlotsLoading(true);
		setSelectedSlot(null);
		setStep('time');

		async function fetchSlots() {
			try {
				const params = new URLSearchParams({ date: selectedDate!, timezone });
				if (selectedStaffId) params.set('staffMemberId', selectedStaffId);
				if (selectedLocationId) params.set('locationId', selectedLocationId);

				const res = await fetch(`/api/products/${variantSlug}/availability?${params}`);
				if (!res.ok) throw new Error('Failed');
				const data = await res.json();
				setSlots(Array.isArray(data) ? data : []);
			} catch {
				setSlots([]);
			} finally {
				setSlotsLoading(false);
			}
		}
		fetchSlots();
	}, [activeVariant, selectedDate, timezone, selectedStaffId, selectedLocationId]);

	const handleSlotSelect = useCallback((slot: CurrentAvailabilitySlot) => {
		setSelectedSlot(slot);
		setConfirmedStaffId(null); // Reset slot-level staff pick for new slot
		setStep('confirm');
	}, []);

	const handleBooking = useCallback(async () => {
		if (!activeVariant || !selectedSlot) return;

		setBooking(true);
		setError(null);

		try {
			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (cartId) headers['X-Cart-Id'] = cartId;

			const res = await fetch('/api/book', {
				method: 'POST',
				headers,
				body: JSON.stringify({
					slot: {
						productId: activeVariant.id,
						fromDate: selectedSlot.fromDate,
						fromTime: selectedSlot.fromTime,
						toDate: selectedSlot.toDate,
						toTime: selectedSlot.toTime,
						staffMemberId: finalStaffId ?? selectedSlot.staffMemberIds?.[0] ?? null,
						locationId: selectedLocationId ?? selectedSlot.locationIds?.[0] ?? null,
					},
					numberOfAttendees: attendees,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Booking failed');
			}

			const data = await res.json();
			if (data.cart) setCart(data.cart);

			setBookingSuccess(true);
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
			setBooking(false);
		}
	}, [activeVariant, selectedSlot, attendees, cartId, setCart, finalStaffId, selectedLocationId]);

	if (loading) {
		return (
			<div className="bg-white pt-32 pb-20 lg:pt-40">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<div className="animate-pulse">
						<div className="h-4 w-32 rounded bg-cream-dark" />
						<div className="mt-6 h-12 w-80 rounded bg-cream-dark" />
						<div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
							<div className="lg:col-span-5">
								<div className="aspect-[4/3] rounded bg-cream-dark" />
								<div className="mt-8 space-y-4">
									<div className="h-4 w-full rounded bg-cream-dark" />
									<div className="h-4 w-3/4 rounded bg-cream-dark" />
								</div>
							</div>
							<div className="lg:col-span-7">
								<div className="h-64 rounded bg-cream-dark" />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error && !product) {
		return (
			<div className="bg-white pt-32 pb-20 lg:pt-40">
				<div className="mx-auto max-w-[1400px] px-6 text-center lg:px-10">
					<p className="text-warm-gray">{error}</p>
					<Link
						href="/services"
						className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
					>
						&larr; Back to Services
					</Link>
				</div>
			</div>
		);
	}

	if (!product) return null;

	const imageUrl = getProductImage(product);

	return (
		<>
			{/* Hero */}
			<section className="bg-white pt-32 pb-12 lg:pt-40 lg:pb-16">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
					>
						<Link
							href="/services"
							className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-warm-gray transition-colors hover:text-accent"
						>
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
							</svg>
							Back to Services
						</Link>
						<h1 className="heading-display mt-6 text-5xl text-charcoal md:text-6xl lg:text-7xl">
							{product.title}
						</h1>
					</motion.div>
				</div>
			</section>

			{/* Booking content */}
			<section className="bg-white pb-20 lg:pb-32">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
						{/* Left — Product info */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, delay: 0.1 }}
							className="lg:col-span-5"
						>
							<div className="aspect-[4/3] overflow-hidden">
								{imageUrl ? (
									<img src={imageUrl} alt={product.title ?? 'Service'} className="h-full w-full object-cover" />
								) : (
									<div className="image-placeholder h-full w-full" />
								)}
							</div>

							{/* Variant tabs */}
							{hasVariants && variants.length > 1 && (
								<div className="mt-6 flex flex-wrap gap-2">
									{variants.map((v) => (
										<button
											key={v.id}
											onClick={() => setSelectedVariantId(v.id)}
											className={`border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-all ${
												(activeVariant?.id ?? variants[0]?.id) === v.id
													? 'border-charcoal bg-charcoal text-white'
													: 'border-charcoal/10 text-charcoal hover:border-charcoal/30'
											}`}
										>
											{v.variantTitle}
										</button>
									))}
								</div>
							)}

							<div className="mt-8">
								{(activeVariant?.description ?? product.description) && (
									<p className="text-base leading-relaxed text-warm-gray">
										{activeVariant?.description ?? product.description}
									</p>
								)}
								<div className="mt-6 space-y-0 border-t border-charcoal/10">
									<div className="flex items-center justify-between border-b border-charcoal/10 py-4">
										<span className="text-sm text-warm-gray">Duration</span>
										<span className="text-sm font-semibold text-charcoal">
											{formatDuration(activeVariant?.duration ?? product.duration)}
										</span>
									</div>
									<div className="flex items-center justify-between border-b border-charcoal/10 py-4">
										<span className="text-sm text-warm-gray">Price</span>
										<span className="text-sm font-semibold text-charcoal">
											{formatPrice(activeVariant?.price ?? product.price)}
										</span>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Right — Booking flow */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7, delay: 0.2 }}
							className="lg:col-span-7"
						>
							<div className="sticky top-28">
								{/* Step indicators */}
								<div className="mb-8 flex items-center gap-3 sm:gap-4">
									{(['date', 'time', 'confirm'] as BookingStep[]).map((s, i) => {
										const stepOrder = ['date', 'time', 'confirm'];
										const currentIdx = stepOrder.indexOf(step);
										return (
											<div key={s} className="flex items-center gap-3 sm:gap-4">
												<div
													className={`flex h-8 w-8 items-center justify-center text-xs font-semibold transition-colors ${
														step === s
															? 'bg-charcoal text-white'
															: i < currentIdx
																? 'bg-accent text-white'
																: 'bg-cream text-warm-gray'
													}`}
												>
													{i + 1}
												</div>
												<span
													className={`hidden text-xs font-medium uppercase tracking-[0.15em] sm:block ${
														step === s ? 'text-charcoal' : 'text-warm-gray'
													}`}
												>
													{s === 'date' ? 'Select Date' : s === 'time' ? 'Choose Time' : 'Confirm'}
												</span>
												{i < 2 && <div className="h-px w-4 bg-charcoal/10 sm:w-8" />}
											</div>
										);
									})}
								</div>

								{/* Error banner */}
								{error && (
									<div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
										{error}
										<button onClick={() => setError(null)} className="ml-2 font-medium underline">
											Dismiss
										</button>
									</div>
								)}

								{/* Location selector (always first, required) */}
								{activeVariant?.locations && activeVariant.locations.length > 0 && (
									<div className="mb-6">
										<LocationSelector
											locations={activeVariant.locations}
											selected={selectedLocationId ?? activeVariant.locations[0]?.id ?? null}
											onSelect={setSelectedLocationId}
										/>
									</div>
								)}

								{/* Staff selector */}
								{staffForLocation.length > 0 && (
									<div className="mb-6">
										<StaffSelector
											staffMembers={staffForLocation}
											selected={selectedStaffId}
											onSelect={setSelectedStaffId}
										/>
									</div>
								)}

								{/* Date picker */}
								<div className="border border-charcoal/10 p-6">
									<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
										Select a Date
									</h3>
									<div className="mt-4">
										<DatePicker selectedDate={selectedDate} onDateSelect={setSelectedDate} />
									</div>
								</div>

								{/* Time slots */}
								{selectedDate && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										transition={{ duration: 0.3 }}
										className="mt-6 overflow-hidden border border-charcoal/10 p-6"
									>
										<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
											Available Times
										</h3>
										<div className="mt-4">
											<TimeSlots
												slots={slots}
												selectedSlot={selectedSlot}
												onSlotSelect={handleSlotSelect}
												loading={slotsLoading}
												timezone={timezone}
												staffMembers={staffForLocation}
											/>
										</div>
									</motion.div>
								)}

								{/* Staff selection after slot pick (when top-level is "Any") */}
								{selectedSlot && !selectedStaffId && staffForLocation.length > 0 && (() => {
									const slotStaff = staffForLocation.filter(
										(s) => selectedSlot.staffMemberIds?.includes(s.id),
									);
									if (slotStaff.length === 0) return null;
									return (
										<motion.div
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: 'auto' }}
											transition={{ duration: 0.3 }}
											className="mt-6"
										>
											<StaffSelector
												staffMembers={slotStaff}
												selected={confirmedStaffId}
												onSelect={setConfirmedStaffId}
											/>
										</motion.div>
									);
								})()}

								{/* Attendees selector */}
								{(activeVariant?.maxAttendees ?? product.maxAttendees) > 1 && selectedSlot && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: 'auto' }}
										transition={{ duration: 0.3 }}
										className="mt-6 border border-charcoal/10 p-6"
									>
										<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
											Number of Attendees
										</h3>
										<div className="mt-4 flex items-center gap-4">
											<button
												onClick={() => setAttendees((a) => Math.max(1, a - 1))}
												className="flex h-10 w-10 items-center justify-center border border-charcoal/10 text-charcoal transition-colors hover:bg-cream"
											>
												-
											</button>
											<span className="w-12 text-center text-lg font-semibold text-charcoal">{attendees}</span>
											<button
												onClick={() =>
													setAttendees((a) =>
														Math.min((activeVariant?.maxAttendees ?? product.maxAttendees) - (selectedSlot?.attendees ?? 0), a + 1),
													)
												}
												className="flex h-10 w-10 items-center justify-center border border-charcoal/10 text-charcoal transition-colors hover:bg-cream"
											>
												+
											</button>
											<span className="text-xs text-warm-gray">
												(max {(activeVariant?.maxAttendees ?? product.maxAttendees) - (selectedSlot?.attendees ?? 0)} available)
											</span>
										</div>
									</motion.div>
								)}

								{/* Booking summary */}
								{selectedSlot && !needsStaffSelection && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.4, delay: 0.1 }}
										className="mt-6 border border-charcoal/10 bg-cream/30 p-6"
									>
										<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
											Booking Summary
										</h3>
										<div className="mt-4 space-y-3">
											<div className="flex justify-between text-sm">
												<span className="text-warm-gray">Service</span>
												<span className="text-right font-medium text-charcoal">
													{hasVariants && product ? `${product.title} — ${activeVariant?.title}` : (activeVariant?.title ?? product?.title)}
												</span>
											</div>
											{(() => {
												const staffMember = staffForLocation.find((s) => s.id === finalStaffId);
												return staffMember ? (
													<div className="flex justify-between text-sm">
														<span className="text-warm-gray">Stylist</span>
														<span className="font-medium text-charcoal">{staffMember.firstName ?? 'Staff'}</span>
													</div>
												) : null;
											})()}
											{(() => {
												const location = activeVariant?.locations?.find((l) => l.id === selectedLocationId);
												return location ? (
													<div className="flex justify-between text-sm">
														<span className="text-warm-gray">Location</span>
														<span className="font-medium text-charcoal">{location.title ?? 'Location'}</span>
													</div>
												) : null;
											})()}
											<div className="flex justify-between text-sm">
												<span className="text-warm-gray">Date</span>
												<span className="font-medium text-charcoal">
													{formatCustom(selectedDate + 'T00:00:00', 'dddd, MMMM D, YYYY')}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-warm-gray">Time</span>
												<span className="font-medium text-charcoal">
													{(() => {
														const [start, end] = formatTimeRange(selectedSlot.fromDate, selectedSlot.fromTime, selectedSlot.toDate, selectedSlot.toTime);
														return `${start} - ${end}`;
													})()}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-warm-gray">Duration</span>
												<span className="font-medium text-charcoal">{formatDuration(activeVariant?.duration ?? product.duration)}</span>
											</div>
											{attendees > 1 && (
												<div className="flex justify-between text-sm">
													<span className="text-warm-gray">Attendees</span>
													<span className="font-medium text-charcoal">{attendees}</span>
												</div>
											)}
											<div className="border-t border-charcoal/10 pt-3">
												<div className="flex justify-between">
													<span className="text-sm font-semibold text-charcoal">Total</span>
													<span className="text-lg font-bold text-charcoal">
														{formatPrice((activeVariant?.price ?? product.price) * attendees)}
													</span>
												</div>
											</div>
										</div>

										{bookingSuccess ? (
											<div className="mt-6 space-y-3">
												<div className="flex items-center gap-2 text-sm font-medium text-green-700">
													<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
														<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
													</svg>
													Added to cart!
												</div>
												<Link
													href="/checkout"
													className="flex w-full items-center justify-center gap-3 bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent"
												>
													Proceed to Checkout
													<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
														<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
													</svg>
												</Link>
												<Link
													href="/services"
													className="flex w-full items-center justify-center border border-charcoal/10 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-cream"
												>
													Add More Services
												</Link>
											</div>
										) : (
											<button
												onClick={handleBooking}
												disabled={booking}
												className="mt-6 flex w-full items-center justify-center gap-3 bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent disabled:opacity-50"
											>
												{booking ? (
													<>
														<svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
															<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
															<path
																className="opacity-75"
																fill="currentColor"
																d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
															/>
														</svg>
														Processing...
													</>
												) : (
													<>
														Add to Cart
														<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
															<path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
														</svg>
													</>
												)}
											</button>
										)}
									</motion.div>
								)}
							</div>
						</motion.div>
					</div>
				</div>
			</section>
		</>
	);
}

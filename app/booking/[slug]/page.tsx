'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { computeAddOnLineTotal, formatDuration, formatPrice, getProductImage } from '@/lib/format';
import { BOOKING_STEPS, STEP_LABELS, type BookingStep } from '@/lib/booking-constants';
import { DatePicker } from '@/components/booking/date-picker';
import { TimeSlots } from '@/components/booking/time-slots';
import { StaffSelector } from '@/components/booking/staff-selector';
import { LocationSelector } from '@/components/booking/location-selector';
import { AddOnsSelector } from '@/components/booking/addons-selector';
import { useBookingFlow } from '@/hooks/use-booking-flow';
import { useSettings } from '@/contexts/settings-context';

export default function BookingPage() {
	const params = useParams();
	const slug = params.slug as string;
	const { currency } = useSettings();
	const flow = useBookingFlow(slug);

	if (flow.loading) {
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

	if (flow.error && !flow.product) {
		return (
			<div className="bg-white pt-32 pb-20 lg:pt-40">
				<div className="mx-auto max-w-[1400px] px-6 text-center lg:px-10">
					<p className="text-warm-gray">{flow.error}</p>
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

	if (!flow.product) return null;

	const imageUrl = getProductImage(flow.product);

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
							{flow.product.title}
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
									<img src={imageUrl} alt={flow.product.title ?? 'Service'} className="h-full w-full object-cover" />
								) : (
									<div className="image-placeholder h-full w-full" />
								)}
							</div>

							{/* Variant tabs */}
							{flow.hasVariants && flow.variants.length > 1 && (
								<div className="mt-6 flex flex-wrap gap-2">
									{flow.variants.map((v) => (
										<button
											key={v.id}
											onClick={() => flow.setSelectedVariantId(v.id)}
											className={`border px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-all ${
												(flow.activeVariant?.id ?? flow.variants[0]?.id) === v.id
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
								{(flow.activeVariant?.description ?? flow.product.description) && (
									<p className="text-base leading-relaxed text-warm-gray">
										{flow.activeVariant?.description ?? flow.product.description}
									</p>
								)}
								<div className="mt-6 space-y-0 border-t border-charcoal/10">
									<div className="flex items-center justify-between border-b border-charcoal/10 py-4">
										<span className="text-sm text-warm-gray">Duration</span>
										<span className="text-sm font-semibold text-charcoal">
											{formatDuration(flow.activeVariant?.duration ?? flow.product.duration)}
										</span>
									</div>
									<div className="flex items-center justify-between border-b border-charcoal/10 py-4">
										<span className="text-sm text-warm-gray">Price</span>
										<span className="text-sm font-semibold text-charcoal">
											{formatPrice(flow.activeVariant?.price ?? flow.product.price, currency)}
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
								<BookingStepIndicator currentStep={flow.step} />

								{/* Error banner */}
								{flow.error && (
									<div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
										{flow.error}
										<button onClick={() => flow.setError(null)} className="ml-2 font-medium underline">
											Dismiss
										</button>
									</div>
								)}

								{/* Location selector */}
								{flow.activeVariant?.locations && flow.activeVariant.locations.length > 0 && (
									<div className="mb-6">
										<LocationSelector
											locations={flow.activeVariant.locations}
											selected={flow.selectedLocationId ?? flow.activeVariant.locations[0]?.id ?? null}
											onSelect={flow.setSelectedLocationId}
										/>
									</div>
								)}

								{/* Staff selector */}
								{flow.staffForLocation.length > 0 && (
									<div className="mb-6">
										<StaffSelector
											staffMembers={flow.staffForLocation}
											selected={flow.selectedStaffId}
											onSelect={flow.setSelectedStaffId}
										/>
									</div>
								)}

								{/* Date picker */}
								<div className="border border-charcoal/10 p-6">
									<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
										Select a Date
									</h3>
									<div className="mt-4">
										<DatePicker selectedDate={flow.selectedDate} onDateSelect={flow.setSelectedDate} />
									</div>
								</div>

								{/* Time slots */}
								{flow.selectedDate && (
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
												slots={flow.slots}
												selectedSlot={flow.selectedSlot}
												onSlotSelect={flow.handleSlotSelect}
												loading={flow.slotsLoading}
												timezone={flow.timezone}
												staffMembers={flow.staffForLocation}
											/>
										</div>
									</motion.div>
								)}

								{/* Staff selection after slot pick (when top-level is "Any") */}
								{flow.selectedSlot && !flow.selectedStaffId && flow.staffForLocation.length > 0 && (() => {
									const slotStaff = flow.staffForLocation.filter(
										(s) => flow.selectedSlot!.staffMemberIds?.includes(s.id),
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
												selected={flow.confirmedStaffId}
												onSelect={flow.setConfirmedStaffId}
											/>
										</motion.div>
									);
								})()}

								{/* Attendees selector */}
								{(flow.activeVariant?.maxAttendees ?? flow.product.maxAttendees) > 1 && flow.selectedSlot && (
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
												onClick={() => flow.setAttendees((a) => Math.max(1, a - 1))}
												className="flex h-10 w-10 items-center justify-center border border-charcoal/10 text-charcoal transition-colors hover:bg-cream"
											>
												-
											</button>
											<span className="w-12 text-center text-lg font-semibold text-charcoal">{flow.attendees}</span>
											<button
												onClick={() =>
													flow.setAttendees((a) =>
														Math.min((flow.activeVariant?.maxAttendees ?? flow.product!.maxAttendees) - (flow.selectedSlot?.attendees ?? 0), a + 1),
													)
												}
												className="flex h-10 w-10 items-center justify-center border border-charcoal/10 text-charcoal transition-colors hover:bg-cream"
											>
												+
											</button>
											<span className="text-xs text-warm-gray">
												(max {(flow.activeVariant?.maxAttendees ?? flow.product.maxAttendees) - (flow.selectedSlot?.attendees ?? 0)} available)
											</span>
										</div>
									</motion.div>
								)}

								{/* Add-ons step */}
								{flow.selectedSlot && !flow.needsStaffSelection && flow.step === 'add-ons' && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3 }}
										className="mt-6"
									>
										<AddOnsSelector
											addOns={flow.availableAddOns}
											loading={flow.addOnsLoading}
											selected={flow.selectedAddOns}
											bookedDurationUnits={flow.bookedDurationUnits}
											currency={currency}
											onChange={flow.updateAddOnQuantity}
										/>
										<button
											onClick={() => flow.setStep('confirm')}
											className="mt-6 flex w-full items-center justify-center gap-3 bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent"
										>
											Continue
											<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
											</svg>
										</button>
									</motion.div>
								)}

								{/* Booking summary */}
								{flow.selectedSlot && !flow.needsStaffSelection && flow.step === 'confirm' && (
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
													{flow.hasVariants && flow.product ? `${flow.product.title} — ${flow.activeVariant?.title}` : (flow.activeVariant?.title ?? flow.product?.title)}
												</span>
											</div>
											{(() => {
												const staffMember = flow.staffForLocation.find((s) => s.id === flow.finalStaffId);
												return staffMember ? (
													<div className="flex justify-between text-sm">
														<span className="text-warm-gray">Stylist</span>
														<span className="font-medium text-charcoal">{staffMember.firstName ?? 'Staff'}</span>
													</div>
												) : null;
											})()}
											{(() => {
												const location = flow.activeVariant?.locations?.find((l) => l.id === flow.selectedLocationId);
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
													{flow.formatCustom(flow.selectedDate + 'T00:00:00', 'dddd, MMMM D, YYYY')}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-warm-gray">Time</span>
												<span className="font-medium text-charcoal">
													{(() => {
														const [start, end] = flow.formatTimeRange(flow.selectedSlot!.fromDate, flow.selectedSlot!.fromTime, flow.selectedSlot!.toDate, flow.selectedSlot!.toTime);
														return `${start} - ${end}`;
													})()}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-warm-gray">Duration</span>
												<span className="font-medium text-charcoal">{formatDuration(flow.activeVariant?.duration ?? flow.product.duration)}</span>
											</div>
											{flow.attendees > 1 && (
												<div className="flex justify-between text-sm">
													<span className="text-warm-gray">Attendees</span>
													<span className="font-medium text-charcoal">{flow.attendees}</span>
												</div>
											)}
											{flow.selectedAddOns.size > 0 && (
												<div className="border-t border-charcoal/10 pt-3 space-y-1.5">
													<p className="text-xs font-semibold uppercase tracking-[0.15em] text-warm-gray">Add-ons</p>
													{Array.from(flow.selectedAddOns.entries()).map(([addOnId, qty]) => {
														const addOn = flow.availableAddOns.find((a) => a.id === addOnId);
														if (!addOn) return null;
														const lineTotal = computeAddOnLineTotal(addOn, qty, flow.bookedDurationUnits);
														return (
															<div key={addOnId} className="flex justify-between text-xs">
																<span className="text-warm-gray">
																	{addOn.title ?? addOn.slug}
																	{!addOn.durationMultiplied && qty > 1 && ` × ${qty}`}
																</span>
																<span className="font-medium text-charcoal">{formatPrice(lineTotal, currency)}</span>
															</div>
														);
													})}
												</div>
											)}
											<div className="border-t border-charcoal/10 pt-3">
												<div className="flex justify-between">
													<span className="text-sm font-semibold text-charcoal">Total</span>
													<span className="text-lg font-bold text-charcoal">
														{formatPrice((flow.activeVariant?.price ?? flow.product.price) * flow.attendees + flow.addOnsTotal, currency)}
													</span>
												</div>
											</div>
										</div>

										{flow.bookingSuccess ? (
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
												onClick={flow.handleBooking}
												disabled={flow.booking}
												className="mt-6 flex w-full items-center justify-center gap-3 bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent disabled:opacity-50"
											>
												{flow.booking ? (
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

function BookingStepIndicator({ currentStep }: { currentStep: BookingStep }) {
	const currentIdx = BOOKING_STEPS.indexOf(currentStep);

	return (
		<div className="mb-8 flex items-center gap-3 sm:gap-4">
			{BOOKING_STEPS.map((s, i) => (
				<div key={s} className="flex items-center gap-2 sm:gap-3">
					<div
						className={`flex h-8 w-8 items-center justify-center text-xs font-semibold transition-colors ${
							currentStep === s
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
							currentStep === s ? 'text-charcoal' : 'text-warm-gray'
						}`}
					>
						{STEP_LABELS[s]}
					</span>
					{i < BOOKING_STEPS.length - 1 && <div className="h-px w-3 bg-charcoal/10 sm:w-6" />}
				</div>
			))}
		</div>
	);
}

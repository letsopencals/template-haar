'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ProductListItemResponse } from '@opencals/storefront-sdk';
import { useBookingFlow, type BookingDeepLink } from '@/hooks/use-booking-flow';
import { useSettings } from '@/contexts/settings-context';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';
import { buttonClasses } from '@/components/ui/button';
import { formatDuration, formatPrice, getProductImage } from '@/lib/format';
import { getStaffName } from '@/lib/staff-utils';
import { SECTION_TITLES, type BookingSectionIndex } from '@/lib/booking-constants';
import { salonName } from '@/components/services/location-filter';
import { BookSection, type SectionState } from './book-section';
import { BookingHeader } from './booking-header';
import { ServicePicker } from './service-picker';
import { StylistPicker } from './stylist-picker';
import { DayRibbon } from './day-ribbon';
import { SlotGrid } from './slot-grid';
import { StylistConfirm } from './stylist-confirm';
import { FinishingTouches } from './finishing-touches';
import { AppointmentCard } from './appointment-card';
import { MobileCardBar } from './mobile-card-bar';
import { formatLongDate, formatSlotRange, formatSlotTime } from './slot-time';

const SECTION_IDS = ['book-service', 'book-stylist', 'book-time', 'book-extras'] as const;

interface BookingViewProps {
	slug: string;
	initialProduct: ProductListItemResponse | null;
	deepLink?: BookingDeepLink;
}

/**
 * The consultation-card composer: numbered sections on the left unlock in
 * order; the live appointment card on the right (a bottom sheet below lg)
 * writes itself in as choices are made and flips once the chair is held.
 */
export function BookingView({ slug, initialProduct, deepLink }: BookingViewProps) {
	const { currency, timeFormat } = useSettings();
	const flow = useBookingFlow(slug, initialProduct, deepLink);
	const lenis = useSmoothScroll();
	const [sheetOpen, setSheetOpen] = useState(false);
	const sectionRefs = useRef<Array<HTMLElement | null>>([]);

	// Bring the newly unlocked section into view — only after the visitor has
	// done something, so data settling on load (or StrictMode's double effect)
	// never scrolls the page away from the header.
	const { reached } = flow;
	const prevReached = useRef(reached);
	const interacted = useRef(false);
	useEffect(() => {
		const mark = () => {
			interacted.current = true;
		};
		window.addEventListener('pointerdown', mark, { once: true });
		window.addEventListener('keydown', mark, { once: true });
		return () => {
			window.removeEventListener('pointerdown', mark);
			window.removeEventListener('keydown', mark);
		};
	}, []);
	useEffect(() => {
		if (prevReached.current === reached) return;
		prevReached.current = reached;
		if (!interacted.current) return;
		const el = sectionRefs.current[reached];
		if (!el) return;
		const timer = window.setTimeout(() => {
			if (lenis) lenis.scrollTo(el, { offset: -96, duration: 1.1 });
			else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 120);
		return () => window.clearTimeout(timer);
	}, [reached, lenis]);

	const onReserved = useCallback(() => {
		if (window.matchMedia('(max-width: 1023px)').matches) setSheetOpen(true);
	}, []);

	if (flow.loading) return <ComposerSkeleton />;

	if (!flow.product || !flow.activeVariant) {
		return (
			<div className="container-x pt-40 pb-section text-center">
				<p className="font-display text-3xl italic text-warm-gray">{flow.productError ?? 'We couldn’t find that service.'}</p>
				<Link href="/services" className={buttonClasses({ variant: 'outline', size: 'md', className: 'mt-8' })}>
					&larr; Back to The Menu
				</Link>
			</div>
		);
	}

	const { product, activeVariant, variants, allStaff, staffForLocation, selectedSlot, timezone } = flow;
	const locations = activeVariant.locations ?? [];
	const hasStaff = allStaff.length > 0;
	const anyMode = hasStaff && !flow.selectedStaffId;

	// Section states (derived; a section is only "done" once it's actually answered).
	const serviceState: SectionState = reached === 0 ? 'open' : 'done';
	const stylistState: SectionState = reached < 1 ? 'locked' : reached === 1 || !flow.stylistChosen ? 'open' : 'done';
	const timeState: SectionState = reached < 2 ? 'locked' : reached === 2 || !flow.timeComplete ? 'open' : 'done';
	const extrasState: SectionState = reached >= 3 && flow.timeComplete ? 'open' : 'locked';

	const serviceSummary = [
		flow.hasVariants ? activeVariant.variantTitle || activeVariant.title : null,
		formatDuration(activeVariant.duration),
		flow.selectedLocation ? salonName(flow.selectedLocation) : null,
	]
		.filter(Boolean)
		.join(' · ');
	const stylistSummary = flow.selectedStaffId && flow.finalStaff ? getStaffName(flow.finalStaff) : 'Any stylist — first available';
	const timeSummary = selectedSlot
		? `${formatLongDate(selectedSlot.fromDate)} · ${formatSlotRange(selectedSlot, timezone, timeFormat)}${anyMode && flow.finalStaff ? ` · ${getStaffName(flow.finalStaff)}` : ''}`
		: '';

	const sectionNumber = (i: BookingSectionIndex) => (hasStaff || i < 1 ? i : i - 1);
	const editable = flow.hasVariants || locations.length > 1;
	const image = getProductImage(product) ?? getProductImage(activeVariant);

	const card = <AppointmentCard flow={flow} currency={currency} timeFormat={timeFormat} onReserved={onReserved} />;
	const status = flow.bookingSuccess
		? 'Continue to checkout'
		: flow.missing.length
			? `Still to choose: ${flow.missing.join(', ')}`
			: 'Ready to reserve';

	return (
		<div className="bg-paper pt-32 pb-36 lg:pt-40 lg:pb-section">
			<div className="container-x">
				<BookingHeader
					title={product.title ?? activeVariant.title ?? 'Service'}
					description={product.description || activeVariant.description}
					image={image}
					meta={`${formatDuration(activeVariant.duration)} · ${formatPrice(flow.basePrice, currency)}`}
				/>

				<div className="mt-16 grid grid-cols-1 gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-16">
					<div className="min-w-0 lg:col-span-7">
						<BookSection
							ref={(el) => {
								sectionRefs.current[0] = el;
							}}
							id={SECTION_IDS[0]}
							index={sectionNumber(0)}
							title={SECTION_TITLES.service}
							state={serviceState}
							summary={serviceSummary}
							onEdit={editable ? () => flow.openSection(0) : undefined}
						>
							<ServicePicker
								variants={variants}
								hasVariants={flow.hasVariants}
								selectedVariantId={flow.selectedVariantId}
								onSelectVariant={flow.selectVariant}
								locations={locations}
								selectedLocationId={flow.selectedLocationId}
								onSelectLocation={flow.selectLocation}
								currency={currency}
								onContinue={flow.continueFromService}
							/>
						</BookSection>

						{hasStaff ? (
							<BookSection
								ref={(el) => {
									sectionRefs.current[1] = el;
								}}
								id={SECTION_IDS[1]}
								index={sectionNumber(1)}
								title={SECTION_TITLES.stylist}
								state={stylistState}
								summary={stylistSummary}
								lockedHint="Choose your option first"
								onEdit={() => flow.openSection(1)}
							>
								<StylistPicker
									staff={staffForLocation}
									selectedStaffId={flow.selectedStaffId}
									answered={flow.stylistChosen}
									onSelect={flow.selectStaff}
								/>
							</BookSection>
						) : null}

						<BookSection
							ref={(el) => {
								sectionRefs.current[2] = el;
							}}
							id={SECTION_IDS[2]}
							index={sectionNumber(2)}
							title={SECTION_TITLES.time}
							state={timeState}
							summary={timeSummary}
							lockedHint={hasStaff ? 'Choose a stylist first' : 'Choose your option first'}
							onEdit={() => flow.openSection(2)}
						>
							<DayRibbon
								selected={flow.selectedDate}
								onSelect={flow.selectDate}
								availableDates={flow.availableDates}
								timezone={timezone}
							/>
							<div className="mt-8">
								{flow.selectedDate ? (
									<>
										<p className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
											<span className="font-display text-xl text-charcoal">{formatLongDate(flow.selectedDate)}</span>
											<span className="text-xs text-warm-gray">Times in {timezone.replace(/_/g, ' ')}</span>
										</p>
										<SlotGrid
											slots={flow.slots}
											selected={selectedSlot}
											onSelect={flow.selectTimeSlot}
											loading={flow.slotsLoading}
											timezone={timezone}
											timeFormat={timeFormat}
											staff={anyMode ? staffForLocation : undefined}
										/>
										{anyMode && selectedSlot ? (
											<StylistConfirm
												staff={flow.slotStaff}
												confirmedId={flow.confirmedStaffId}
												onConfirm={flow.confirmStaff}
												timeLabel={formatSlotTime(selectedSlot.fromDate, selectedSlot.fromTime, timezone, timeFormat)}
											/>
										) : null}
									</>
								) : (
									<p className="font-display text-lg italic text-warm-gray">Choose a day to see the times.</p>
								)}
							</div>
						</BookSection>

						<BookSection
							ref={(el) => {
								sectionRefs.current[3] = el;
							}}
							id={SECTION_IDS[3]}
							index={sectionNumber(3)}
							title={SECTION_TITLES.extras}
							state={extrasState}
							lockedHint="Choose a time first"
						>
							<FinishingTouches
								addOns={flow.availableAddOns}
								loading={flow.addOnsLoading}
								selected={flow.selectedAddOns}
								bookedDurationUnits={flow.bookedDurationUnits}
								currency={currency}
								onChange={flow.updateAddOnQuantity}
								maxAttendees={flow.maxAttendees}
								seatsLeft={flow.seatsLeft}
								attendees={flow.attendees}
								onAttendeesChange={flow.changeAttendees}
							/>
						</BookSection>
						<div className="border-t border-line-strong" aria-hidden />
					</div>

					<aside className="hidden lg:col-span-5 lg:block xl:col-span-4 xl:col-start-9" aria-label="Your appointment">
						<div className="sticky top-28">{card}</div>
					</aside>
				</div>
			</div>

			<MobileCardBar
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				total={flow.total}
				currency={currency}
				status={status}
				held={flow.bookingSuccess}
			>
				{card}
			</MobileCardBar>
		</div>
	);
}

function ComposerSkeleton() {
	return (
		<div className="container-x pt-32 pb-section lg:pt-40" aria-busy="true" aria-label="Loading the service">
			<div className="h-3 w-40 animate-pulse bg-cream-dark" />
			<div className="mt-8 h-14 w-3/4 max-w-xl animate-pulse bg-cream-dark" />
			<div className="mt-16 grid gap-12 lg:grid-cols-12">
				<div className="space-y-6 lg:col-span-7">
					{[0, 1, 2, 3].map((i) => (
						<div key={i} className="h-20 animate-pulse bg-cream-dark" />
					))}
				</div>
				<div className="hidden h-[32rem] animate-pulse bg-cream-dark lg:col-span-5 lg:block xl:col-span-4 xl:col-start-9" />
			</div>
		</div>
	);
}

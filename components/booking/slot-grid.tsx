'use client';

import { memo, useId, useMemo } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { CurrentAvailabilitySlot, ProductListVariantStaffMember as StaffMember } from '@opencals/storefront-sdk';
import { SPRING_SOFT } from '@/components/motion/easing';
import { FaceStack } from './staff-face';
import { DAY_PARTS, DAY_PART_LABELS, dayPartOf, formatSlotTime, slotHour, slotKey, type DayPart } from './slot-time';

type Face = Pick<StaffMember, 'id' | 'firstName' | 'lastName' | 'image'>;

export interface SlotGridProps {
	slots: CurrentAvailabilitySlot[];
	selected: CurrentAvailabilitySlot | null;
	onSelect: (slot: CurrentAvailabilitySlot) => void;
	/** Displays/groups times in this timezone. */
	timezone: string;
	timeFormat?: '12H' | '24H';
	loading?: boolean;
	/**
	 * Pass the candidate stylists to show who is free on each time (the
	 * "Any stylist" mode). Omit to show plain times.
	 */
	staff?: Face[];
	/** Message when the day has no times. */
	emptyText?: string;
}

/**
 * Times for a day, grouped Morning / Afternoon / Evening. With `staff`, each
 * time carries a small stack of the faces free then. Reusable (booking
 * composer, account reschedule).
 */
export function SlotGrid({
	slots,
	selected,
	onSelect,
	timezone,
	timeFormat = '12H',
	loading = false,
	staff,
	emptyText = 'Nothing free this day — try another.',
}: SlotGridProps) {
	const groupId = useId();
	const selectedKey = selected ? slotKey(selected) : null;

	const groups = useMemo(() => {
		const out: Record<DayPart, CurrentAvailabilitySlot[]> = { morning: [], afternoon: [], evening: [] };
		for (const slot of slots) out[dayPartOf(slotHour(slot.fromDate, slot.fromTime, timezone))].push(slot);
		return out;
	}, [slots, timezone]);

	const byId = useMemo(() => (staff ? new Map(staff.map((s) => [s.id, s])) : null), [staff]);

	if (loading) {
		return (
			<div className="space-y-6" aria-busy="true" aria-label="Loading times">
				{[0, 1].map((g) => (
					<div key={g}>
						<div className="h-3 w-20 animate-pulse bg-cream-dark" />
						<div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
							{[0, 1, 2, 3].map((i) => (
								<div key={i} className="h-12 animate-pulse bg-cream-dark" />
							))}
						</div>
					</div>
				))}
			</div>
		);
	}

	if (slots.length === 0) {
		return <p className="border border-dashed border-line-strong px-5 py-8 text-center font-display text-lg italic text-warm-gray">{emptyText}</p>;
	}

	return (
		<LayoutGroup id={groupId}>
			<div className="space-y-7">
				{DAY_PARTS.map((part) =>
					groups[part].length ? (
						<fieldset key={part}>
							<legend className="eyebrow flex w-full items-center gap-3 text-warm-gray">
								{DAY_PART_LABELS[part]}
								<span className="h-px flex-1 bg-line" aria-hidden />
								<span className="tabular text-[0.65rem]">{groups[part].length}</span>
							</legend>
							<div className={clsx('mt-3 grid gap-2', byId ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-4')}>
								{groups[part].map((slot) => {
									const key = slotKey(slot);
									return (
										<SlotButton
											key={key}
											slot={slot}
											active={key === selectedKey}
											label={formatSlotTime(slot.fromDate, slot.fromTime, timezone, timeFormat)}
											faces={byId ? (slot.staffMemberIds ?? []).map((id) => byId.get(id)).filter((s): s is Face => !!s) : null}
											onSelect={onSelect}
										/>
									);
								})}
							</div>
						</fieldset>
					) : null,
				)}
			</div>
		</LayoutGroup>
	);
}

const SlotButton = memo(function SlotButton({
	slot,
	active,
	label,
	faces,
	onSelect,
}: {
	slot: CurrentAvailabilitySlot;
	active: boolean;
	label: string;
	faces: Face[] | null;
	onSelect: (slot: CurrentAvailabilitySlot) => void;
}) {
	const free = faces?.length ?? 0;
	return (
		<button
			type="button"
			aria-pressed={active}
			aria-label={faces ? `${label}, ${free} ${free === 1 ? 'stylist' : 'stylists'} free` : label}
			onClick={() => onSelect(slot)}
			className={clsx(
				'relative flex min-h-12 items-center gap-2 border px-3 py-2.5 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
				faces ? 'justify-between' : 'justify-center',
				active ? 'border-charcoal text-cream' : 'border-line text-charcoal hover:border-charcoal/50',
			)}
		>
			{active ? <motion.span layoutId="slot-fill" transition={SPRING_SOFT} className="absolute inset-0 bg-charcoal" aria-hidden /> : null}
			<span className="tabular relative text-sm">{label}</span>
			{faces && faces.length ? (
				<span className="relative">
					<FaceStack staff={faces} max={2} size="h-5 w-5 text-[0.55rem]" />
				</span>
			) : null}
		</button>
	);
});

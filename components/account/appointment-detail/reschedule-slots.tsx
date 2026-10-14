'use client';

import { memo, useMemo } from 'react';
import { clsx } from 'clsx';
import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import {
	DAY_PARTS,
	DAY_PART_LABELS,
	dayPartOf,
	formatSlotTime,
	slotHour,
	slotKey,
	type DayPart,
} from '@/components/booking/slot-time';

/**
 * Times for the chosen day, grouped Morning / Afternoon / Evening. Squared
 * chips; the chosen one fills charcoal. Full slots are skipped.
 */
export const RescheduleSlots = memo(function RescheduleSlots({
	slots,
	selectedKey,
	onSelect,
	timezone,
	timeFormat,
	currentKey,
}: {
	slots: CurrentAvailabilitySlot[];
	selectedKey: string | null;
	onSelect: (slot: CurrentAvailabilitySlot) => void;
	timezone: string;
	timeFormat: '12H' | '24H';
	/** The appointment's current start, labelled "Current". */
	currentKey?: string;
}) {
	const groups = useMemo(() => {
		const map = new Map<DayPart, CurrentAvailabilitySlot[]>();
		for (const s of slots) {
			if (s.maxAttendees && s.attendees >= s.maxAttendees) continue;
			const part = dayPartOf(slotHour(s.fromDate, s.fromTime, timezone));
			const list = map.get(part) ?? [];
			list.push(s);
			map.set(part, list);
		}
		return DAY_PARTS.filter((p) => map.has(p)).map((p) => ({ part: p, slots: map.get(p)! }));
	}, [slots, timezone]);

	if (groups.length === 0) {
		return <p className="py-6 text-center text-sm text-warm-gray">No free times on this day. Try another.</p>;
	}

	return (
		<div className="space-y-6" role="radiogroup" aria-label="Available times">
			{groups.map(({ part, slots: list }) => (
				<div key={part}>
					<p className="eyebrow mb-3 flex items-center gap-3 text-warm-gray">
						{DAY_PART_LABELS[part]}
						<span aria-hidden className="h-px flex-1 bg-line" />
						<span className="tabular text-[0.6rem]">{String(list.length).padStart(2, '0')}</span>
					</p>
					<div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
						{list.map((slot) => {
							const key = slotKey(slot);
							const selected = key === selectedKey;
							const current = key === currentKey;
							return (
								<button
									key={key}
									type="button"
									role="radio"
									aria-checked={selected}
									onClick={() => onSelect(slot)}
									className={clsx(
										'tabular relative border px-2 py-3 text-sm transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
										selected
											? 'border-charcoal bg-charcoal text-cream'
											: 'border-line text-charcoal hover:border-charcoal/50',
									)}
								>
									{formatSlotTime(slot.fromDate, slot.fromTime, timezone, timeFormat)}
									{current ? (
										<span className={clsx('eyebrow mt-0.5 block text-[0.5rem]', selected ? 'text-brass-light' : 'text-brass')}>
											Current
										</span>
									) : null}
								</button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
});

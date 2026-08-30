'use client';

import type { CurrentAvailabilitySlot, ProductListVariantStaffMember as StaffMember } from '@opencals/storefront-sdk';
import { StaffAvatars } from '@/components/ui/staff-avatars';

interface TimeSlotsProps {
	slots: CurrentAvailabilitySlot[];
	selectedSlot: CurrentAvailabilitySlot | null;
	onSlotSelect: (slot: CurrentAvailabilitySlot) => void;
	loading: boolean;
	timezone: string;
	staffMembers?: StaffMember[];
}

function formatSlotTime(date: string, time: string, timezone: string): string {
	const utc = new Date(`${date}T${time}Z`);
	return utc.toLocaleTimeString('en-US', {
		timeZone: timezone,
		hour: 'numeric',
		minute: '2-digit',
		hour12: true,
	});
}

export function TimeSlots({ slots, selectedSlot, onSlotSelect, loading, timezone, staffMembers = [] }: TimeSlotsProps) {
	if (loading) {
		return (
			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="h-14 animate-pulse rounded bg-cream-dark" />
				))}
			</div>
		);
	}

	if (slots.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-sm text-warm-gray">No available time slots for this date.</p>
				<p className="mt-1 text-xs text-warm-gray/70">Try selecting a different date.</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
			{slots.map((slot) => {
				const isSelected = selectedSlot?.fromDate === slot.fromDate && selectedSlot?.fromTime === slot.fromTime;
				const isFull = slot.attendees >= slot.maxAttendees;
				const timeStr = formatSlotTime(slot.fromDate, slot.fromTime, timezone);

				// Get staff members available for this slot
				const slotStaff = staffMembers.filter((s) => slot.staffMemberIds?.includes(s.id));

				return (
					<button
						key={`${slot.fromDate}-${slot.fromTime}`}
						onClick={() => !isFull && onSlotSelect(slot)}
						disabled={isFull}
						className={`
							flex min-h-[3.5rem] flex-col items-center justify-center gap-1 border px-2 py-2 transition-all
							${isFull ? 'cursor-not-allowed border-charcoal/5 text-charcoal/25' : 'cursor-pointer'}
							${isSelected ? 'border-charcoal bg-charcoal text-white' : 'border-charcoal/10 text-charcoal hover:border-charcoal/30 hover:bg-cream'}
						`}
					>
						<span className="text-sm font-medium">{timeStr}</span>
						{slotStaff.length > 0 && !isSelected && (
							<StaffAvatars staffMembers={slotStaff} maxVisible={3} size="sm" />
						)}
					</button>
				);
			})}
		</div>
	);
}

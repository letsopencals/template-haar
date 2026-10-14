'use client';

import { memo, useState } from 'react';
import { clsx } from 'clsx';
import type { ProductListVariantStaffMember as StaffMember } from '@opencals/storefront-sdk';
import { getStaffImageUrl, getStaffInitials, getStaffName } from '@/lib/staff-utils';
import { SafeImage } from '@/components/ui/safe-image';
import { FaceStack } from './staff-face';

const INITIAL_VISIBLE = 7;

interface StylistPickerProps {
	staff: StaffMember[];
	/** null = "Any stylist". */
	selectedStaffId: string | null;
	/** Whether the visitor has answered (so "Any" can show as chosen). */
	answered: boolean;
	onSelect: (id: string | null) => void;
}

/** Section 02: "Any stylist — first available" plus an arch portrait per stylist at this salon. */
export function StylistPicker({ staff, selectedStaffId, answered, onSelect }: StylistPickerProps) {
	const [showAll, setShowAll] = useState(false);
	// Keep a chosen stylist visible even when they sit past the fold.
	const selectedIndex = staff.findIndex((s) => s.id === selectedStaffId);
	const limit = showAll ? staff.length : Math.max(INITIAL_VISIBLE, selectedIndex + 1);
	const visible = staff.slice(0, limit);
	const anyActive = answered && !selectedStaffId;

	return (
		<div>
			<div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4">
				<button
					type="button"
					aria-pressed={anyActive}
					onClick={() => onSelect(null)}
					className="group text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
				>
					<span
						className={clsx(
							'arch relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 border transition-colors duration-500',
							anyActive ? 'border-charcoal bg-charcoal text-cream' : 'border-line bg-cream text-charcoal group-hover:border-charcoal/50',
						)}
					>
						<FaceStack staff={staff} max={3} size="h-8 w-8 text-xs" />
						<span className="font-display text-3xl italic leading-none">Any</span>
					</span>
					<span className="mt-3 block font-display text-lg leading-tight text-charcoal">Any stylist</span>
					<span className="block text-xs text-warm-gray">First available</span>
				</button>

				{visible.map((s) => (
					<StylistCard key={s.id} staff={s} active={s.id === selectedStaffId} onSelect={onSelect} />
				))}
			</div>

			{staff.length > limit ? (
				<button type="button" onClick={() => setShowAll(true)} className="link-underline eyebrow mt-8 text-charcoal">
					All {staff.length} stylists
				</button>
			) : null}
		</div>
	);
}

const StylistCard = memo(function StylistCard({
	staff,
	active,
	onSelect,
}: {
	staff: StaffMember;
	active: boolean;
	onSelect: (id: string) => void;
}) {
	const src = getStaffImageUrl(staff);
	const city = staff.locations?.map((l) => l.city).filter(Boolean)[0];
	return (
		<button
			type="button"
			aria-pressed={active}
			onClick={() => onSelect(staff.id)}
			className="group text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
		>
			<span
				className={clsx(
					'arch image-placeholder relative block aspect-[3/4] w-full overflow-hidden ring-offset-2 ring-offset-paper transition-[box-shadow] duration-500',
					active ? 'ring-2 ring-charcoal' : 'ring-0',
				)}
			>
				{src ? (
					<SafeImage
						src={src}
						alt=""
						fill
						sizes="(min-width: 1024px) 12vw, (min-width: 640px) 22vw, 45vw"
						className="object-cover object-top transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-[1.04]"
					/>
				) : (
					<span className="absolute inset-0 flex items-center justify-center font-display text-3xl text-warm-gray">
						{getStaffInitials(staff)}
					</span>
				)}
				{active ? (
					<span className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-charcoal text-cream" aria-hidden>
						<svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6}>
							<path d="M3 8.5l3 3 7-7" strokeLinecap="square" />
						</svg>
					</span>
				) : null}
			</span>
			<span className={clsx('mt-3 block font-display text-lg leading-tight text-charcoal', active && 'italic')}>{getStaffName(staff)}</span>
			{city ? <span className="block text-xs text-warm-gray">{city}</span> : null}
		</button>
	);
});

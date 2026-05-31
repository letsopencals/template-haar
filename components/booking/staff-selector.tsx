'use client';

import type { StaffMember } from '@opencals/storefront-sdk';

interface StaffSelectorProps {
	staffMembers: StaffMember[];
	selected: string | null;
	onSelect: (staffMemberId: string | null) => void;
}

function getImageUrl(staff: StaffMember): string | null {
	const img = staff.image as { url?: string } | undefined;
	return img?.url ?? null;
}

function getInitials(staff: StaffMember): string {
	return (staff.firstName?.[0] ?? staff.email?.[0] ?? '?').toUpperCase();
}

export function StaffSelector({ staffMembers, selected, onSelect }: StaffSelectorProps) {
	if (staffMembers.length === 0) return null;

	return (
		<div className="border border-charcoal/10 p-4">
			<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Select Stylist</h3>
			<div className="-mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-1">
				{/* Any option */}
				<button
					type="button"
					onClick={() => onSelect(null)}
					className="flex flex-col items-center gap-1.5"
				>
					<div
						className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
							selected === null
								? 'border-2 border-charcoal bg-cream'
								: 'border border-charcoal/10 bg-cream/50 hover:border-charcoal/30'
						}`}
					>
						<svg className="h-5 w-5 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
					<span className="w-14 truncate text-center text-[10px] font-medium text-warm-gray">Any</span>
				</button>

				{staffMembers.map((staff) => {
					const imageUrl = getImageUrl(staff);
					const name = staff.firstName ?? 'Staff';
					const isSelected = selected === staff.id;

					return (
						<button
							key={staff.id}
							type="button"
							onClick={() => onSelect(staff.id)}
							className="flex flex-col items-center gap-1.5"
						>
							<div
								className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-sm font-semibold transition-all ${
									isSelected
										? 'border-2 border-charcoal'
										: 'border border-charcoal/10 hover:border-charcoal/30'
								}`}
							>
								{imageUrl ? (
									<img src={imageUrl} alt={name} className="h-full w-full object-cover object-top" />
								) : (
									<span className="text-charcoal">{getInitials(staff)}</span>
								)}
							</div>
							<span className={`w-14 truncate text-center text-[10px] font-medium ${isSelected ? 'text-charcoal' : 'text-warm-gray'}`}>
								{name}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

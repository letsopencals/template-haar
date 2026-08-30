'use client';

import type { ProductListVariantStaffMember as StaffMember } from '@opencals/storefront-sdk';
import { getStaffImageUrl, getStaffInitials } from '@/lib/staff-utils';

interface StaffAvatarsProps {
	staffMembers: StaffMember[];
	maxVisible?: number;
	size?: 'sm' | 'md' | 'lg';
	onClick?: (staffMember: StaffMember) => void;
}

const sizeClasses = {
	sm: 'h-6 w-6 text-[9px]',
	md: 'h-10 w-10 text-xs',
	lg: 'h-12 w-12 text-sm',
};

export function StaffAvatars({ staffMembers, maxVisible = 4, size = 'md', onClick }: StaffAvatarsProps) {
	if (staffMembers.length === 0) return null;

	const effectiveMax = staffMembers.length > maxVisible + 1 ? maxVisible : staffMembers.length;
	const visibleStaff = staffMembers.slice(0, effectiveMax);
	const overflowCount = staffMembers.length - visibleStaff.length;

	const sizeClass = sizeClasses[size];
	const overlapClass = size === 'sm' ? '-ml-1.5' : size === 'md' ? '-ml-3' : '-ml-3.5';

	return (
		<div className="group flex items-center">
			{visibleStaff.map((staff, i) => {
				const imageUrl = getStaffImageUrl(staff);
				return (
					<button
						key={staff.id}
						type="button"
						onClick={onClick ? () => onClick(staff) : undefined}
						className={`relative flex items-center justify-center overflow-hidden rounded-full border-2 border-white bg-cream font-semibold text-charcoal transition-transform hover:z-10 hover:scale-110 ${sizeClass} ${i > 0 ? overlapClass : ''} ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
						title={[staff.firstName, staff.lastName].filter(Boolean).join(' ')}
					>
						{imageUrl ? (
							<img src={imageUrl} alt="" className="h-full w-full object-cover object-top" />
						) : (
							getStaffInitials(staff)
						)}
					</button>
				);
			})}
			{overflowCount > 0 && (
				<div
					className={`relative flex items-center justify-center rounded-full border-2 border-white bg-cream/80 font-medium text-warm-gray ${sizeClass} ${overlapClass}`}
				>
					+{overflowCount}
				</div>
			)}
		</div>
	);
}

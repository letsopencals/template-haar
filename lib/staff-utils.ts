import type { StaffMember } from '@opencals/storefront-sdk';

export function getStaffImageUrl(staff: Pick<StaffMember, 'image'>): string | null {
	return staff.image?.url ?? null;
}

export function getStaffName(staff: Pick<StaffMember, 'firstName' | 'lastName'>): string {
	return [staff.firstName, staff.lastName].filter(Boolean).join(' ');
}

export function getStaffInitials(staff: Pick<StaffMember, 'firstName' | 'lastName'>): string {
	const initials = `${staff.firstName?.[0] ?? ''}${staff.lastName?.[0] ?? ''}`;
	return (initials || '?').toUpperCase();
}

import type { StaffMember } from '@opencals/storefront-sdk';

export function getStaffImageUrl(staff: StaffMember): string | null {
	return staff.image?.url ?? null;
}

export function getStaffInitials(staff: StaffMember): string {
	return (staff.firstName?.[0] ?? staff.email?.[0] ?? '?').toUpperCase();
}

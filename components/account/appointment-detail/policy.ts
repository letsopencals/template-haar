import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';

export interface ChangePolicy {
	canCancel: boolean;
	canReschedule: boolean;
	cancelGap: number;
	rescheduleGap: number;
}

/**
 * Whether the customer can still cancel / move a booking: it must be
 * scheduled, the product must allow it, and the start must be further away
 * than the product's cancel / reschedule gap. The backend enforces the same
 * rules; this only decides which buttons to show.
 */
type PolicyProduct = Pick<
	AppointmentDetailResponse['product'],
	'allowCustomerCancel' | 'allowCustomerReschedule' | 'cancelGap' | 'rescheduleGap'
>;

/** Works for both list items and the detail response. */
export interface PolicyAppointment {
	status: AppointmentDetailResponse['status'];
	from: string;
	product?: PolicyProduct | null;
}

export function getChangePolicy(appointment: PolicyAppointment, now = Date.now()): ChangePolicy {
	const product = appointment.product;
	const isScheduled = appointment.status === 'scheduled';
	const start = new Date(appointment.from).getTime();
	const cancelGap = product?.cancelGap ?? 0;
	const rescheduleGap = product?.rescheduleGap ?? 0;
	return {
		canCancel: isScheduled && product?.allowCustomerCancel !== false && start - cancelGap * 1000 > now,
		canReschedule: isScheduled && product?.allowCustomerReschedule !== false && start - rescheduleGap * 1000 > now,
		cancelGap,
		rescheduleGap,
	};
}

export function formatGap(seconds: number): string {
	const days = Math.floor(seconds / 86_400);
	if (days >= 1 && seconds % 86_400 === 0) return `${days} ${days === 1 ? 'day' : 'days'}`;
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
	if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
	return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
}

import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import type { DiaryAppointment } from '@/components/account/appointment-utils';

/**
 * The stylist in the signature arch, falling back to the service photo and
 * then to the stylist's initials on plaster.
 */
export function StylistPortrait({
	appointment,
	className,
	sizes = '(min-width: 1024px) 22rem, 60vw',
	priority,
}: {
	appointment: Pick<DiaryAppointment, 'staffMember' | 'product'>;
	className?: string;
	sizes?: string;
	priority?: boolean;
}) {
	const staff = appointment.staffMember;
	const src = staff?.image?.url || appointment.product?.image?.url || null;
	const initials = staff ? `${staff.firstName?.[0] ?? ''}${staff.lastName?.[0] ?? ''}`.toUpperCase() : 'H';
	const alt = staff ? `${staff.firstName} ${staff.lastName ?? ''}`.trim() : (appointment.product?.title ?? '');

	return (
		<div className={clsx('arch image-placeholder relative overflow-hidden', className)}>
			<span aria-hidden className="absolute inset-0 flex items-center justify-center font-display text-5xl italic text-warm-gray-light">
				{initials}
			</span>
			<SafeImage src={src} alt={alt} fill sizes={sizes} priority={priority} className="relative object-cover" />
		</div>
	);
}

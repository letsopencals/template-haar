import { clsx } from 'clsx';
import type { ProductListVariantStaffMember as StaffMember } from '@opencals/storefront-sdk';
import { getStaffImageUrl, getStaffInitials } from '@/lib/staff-utils';

/** A round portrait (non-interactive span — safe inside buttons). */
export function StaffFace({ staff, className }: { staff: Pick<StaffMember, 'firstName' | 'lastName' | 'image'>; className?: string }) {
	const src = getStaffImageUrl(staff);
	return (
		<span
			className={clsx(
				'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream-dark font-display text-charcoal ring-2 ring-paper',
				className,
			)}
			aria-hidden
		>
			{src ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={src} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
			) : (
				<span className="text-[0.7em]">{getStaffInitials(staff)}</span>
			)}
		</span>
	);
}

/** Overlapping faces with a "+N" tail. */
export function FaceStack({
	staff,
	max = 3,
	size = 'h-6 w-6 text-xs',
}: {
	staff: Array<Pick<StaffMember, 'id' | 'firstName' | 'lastName' | 'image'>>;
	max?: number;
	size?: string;
}) {
	if (staff.length === 0) return null;
	const shown = staff.length > max + 1 ? staff.slice(0, max) : staff;
	const extra = staff.length - shown.length;
	return (
		<span className="inline-flex items-center" aria-hidden>
			{shown.map((s, i) => (
				<StaffFace key={s.id} staff={s} className={clsx(size, i > 0 && '-ml-2')} />
			))}
			{extra > 0 ? (
				<span className={clsx('-ml-2 inline-flex items-center justify-center rounded-full bg-charcoal text-[0.6rem] text-cream ring-2 ring-paper tabular', size)}>
					+{extra}
				</span>
			) : null}
		</span>
	);
}

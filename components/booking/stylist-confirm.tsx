'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ProductListVariantStaffMember as StaffMember } from '@opencals/storefront-sdk';
import { getStaffName } from '@/lib/staff-utils';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';
import { StaffFace } from './staff-face';

const IN = { opacity: 0, y: 8 };
const SHOWN = { opacity: 1, y: 0 };
const TRANSITION = { duration: 0.5, ease: EASE_OUT };

interface StylistConfirmProps {
	/** Stylists free at the chosen time. */
	staff: StaffMember[];
	confirmedId: string | null;
	onConfirm: (id: string) => void;
	timeLabel: string;
}

/**
 * "Any stylist" mode: once a time is picked, ask who — inline, under the times.
 * "No preference" takes the first free face. Never lets the card proceed without one.
 */
export function StylistConfirm({ staff, confirmedId, onConfirm, timeLabel }: StylistConfirmProps) {
	const reduce = useReducedMotion();
	if (staff.length <= 1) return null;

	return (
		<motion.div
			initial={reduce ? false : IN}
			animate={SHOWN}
			transition={TRANSITION}
			className="mt-8 border border-line bg-cream px-5 py-5"
			role="group"
			aria-label={`Who will see you at ${timeLabel}`}
		>
			<p className="flex flex-wrap items-baseline justify-between gap-2">
				<span className="font-display text-xl text-charcoal">
					Who would you like at <em className="italic-display">{timeLabel}</em>?
				</span>
				<span className="eyebrow text-warm-gray">{staff.length} free</span>
			</p>
			<div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 py-1" data-lenis-prevent>
				{staff.map((s) => {
					const active = s.id === confirmedId;
					return (
						<button
							key={s.id}
							type="button"
							aria-pressed={active}
							onClick={() => onConfirm(s.id)}
							className={clsx(
								'flex shrink-0 items-center gap-2.5 border py-1.5 pr-4 pl-1.5 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-accent',
								active ? 'border-charcoal bg-charcoal text-cream' : 'border-line bg-paper text-charcoal hover:border-charcoal/50',
							)}
						>
							<StaffFace staff={s} className="h-8 w-8 text-xs" />
							<span className="text-sm whitespace-nowrap">{getStaffName(s)}</span>
						</button>
					);
				})}
			</div>
			{!confirmedId ? (
				<button type="button" onClick={() => onConfirm(staff[0]!.id)} className="link-underline eyebrow mt-4 text-charcoal">
					No preference — choose for me
				</button>
			) : null}
		</motion.div>
	);
}

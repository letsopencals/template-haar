'use client';

import { motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';

const STAMP_FROM = { scale: 1.6, opacity: 0, rotate: -18 } as const;
const STAMP_TO = { scale: 1, opacity: 1, rotate: -8 } as const;
const STAMP_TRANSITION: Transition = { type: 'spring', stiffness: 380, damping: 22, mass: 0.8 };
const RING_TRANSITION: Transition = { duration: 1.1, ease: EASE_OUT, delay: 0.15 };

export interface SealProps {
	/** Text set around the ring, e.g. "Confirmed · Held for you". Repeats to fill. */
	ring?: string;
	/** Centre word. Default the HAAR monogram. */
	center?: string;
	size?: number;
	/** 'stamp' plays the stamp-down animation on mount; 'spin' rotates slowly; 'static' does nothing. */
	motion?: 'stamp' | 'spin' | 'static';
	className?: string;
}

/**
 * Brass wax-seal monogram (DESIGN.md §5). Used on the appointment card back,
 * the thank-you "Confirmed" stamp and as a slow-spinning badge on the home hero.
 */
export function Seal({ ring = 'HAAR · The Art of Hair · Est. 2009 · ', center = 'H.', size = 120, motion: mode = 'static', className }: SealProps) {
	const reduce = useReducedMotion();
	const id = `seal-${ring.length}-${size}`;
	const stamp = mode === 'stamp' && !reduce;
	const svg = (
		<svg viewBox="0 0 120 120" width={size} height={size} className={clsx(mode === 'spin' && 'animate-spin-slow')} aria-hidden>
			<defs>
				<path id={id} d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
			</defs>
			<motion.circle
				cx="60"
				cy="60"
				r="57"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
				initial={stamp ? { pathLength: 0 } : false}
				animate={{ pathLength: 1 }}
				transition={RING_TRANSITION}
			/>
			<circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
			<text fill="currentColor" style={{ fontSize: 8.6, letterSpacing: '0.24em', textTransform: 'uppercase', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
				<textPath href={`#${id}`} startOffset="0">
					{ring.repeat(Math.max(1, Math.ceil(64 / ring.length)))}
				</textPath>
			</text>
		</svg>
	);
	return (
		<motion.div
			className={clsx('relative inline-flex items-center justify-center text-brass', className)}
			style={{ width: size, height: size }}
			initial={stamp ? STAMP_FROM : false}
			animate={stamp ? STAMP_TO : undefined}
			transition={STAMP_TRANSITION}
		>
			{svg}
			<span className="absolute font-display italic leading-none" style={{ fontSize: size * 0.3 }}>
				{center}
			</span>
		</motion.div>
	);
}

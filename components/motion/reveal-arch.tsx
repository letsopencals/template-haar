'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_EXPO, VIEWPORT_ONCE } from './easing';

// The arch rises out of a narrow sliver at the base, like the mirror catching light.
const HIDDEN = { clipPath: 'inset(55% 32% 0% 32% round 9999px 9999px 0px 0px)' } as const;
const VISIBLE = { clipPath: 'inset(0% 0% 0% 0% round 9999px 9999px 0px 0px)' } as const;
const TRANSITION = { duration: DURATION.drive, ease: EASE_EXPO } as const;
const IMG_HIDDEN = { scale: 1.25 } as const;
const IMG_VISIBLE = { scale: 1 } as const;

export interface RevealArchProps {
	children: React.ReactNode;
	/** Sizing classes (aspect-*, w-*). The arch shape itself is applied here. */
	className?: string;
	delay?: number;
	/** 'inView' (default) or 'mount' for above-the-fold heroes. */
	trigger?: 'inView' | 'mount';
}

/**
 * HAAR's signature image reveal: an arch-masked container that grows from a
 * sliver at its base while the image inside settles from 1.25× to 1×. Put a
 * fill image (SafeImage / next/image `fill`) inside. Reduced motion: static arch.
 */
export function RevealArch({ children, className, delay = 0, trigger = 'inView' }: RevealArchProps) {
	const reduce = useReducedMotion();
	const play = trigger === 'mount' ? { animate: VISIBLE } : { whileInView: VISIBLE, viewport: VIEWPORT_ONCE };
	const playImg = trigger === 'mount' ? { animate: IMG_VISIBLE } : { whileInView: IMG_VISIBLE, viewport: VIEWPORT_ONCE };
	return (
		<motion.div
			className={clsx('arch relative image-placeholder', className)}
			initial={reduce ? false : HIDDEN}
			{...play}
			transition={{ ...TRANSITION, delay }}
		>
			<motion.div
				className="absolute inset-0"
				initial={reduce ? false : IMG_HIDDEN}
				{...playImg}
				transition={{ ...TRANSITION, duration: DURATION.drive + 0.5, delay }}
			>
				{children}
			</motion.div>
		</motion.div>
	);
}

'use client';

import type { RefObject } from 'react';
import { motion, useScroll, useSpring, type MotionValue } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';

const SPRING = { stiffness: 140, damping: 30, restDelta: 0.001 } as const;

/**
 * Smoothed 0→1 scroll progress — of the page, or of `target` as it passes
 * through the viewport (offset 'start end' → 'end start'). Use it to drive
 * pinned/scroll-linked sections with useTransform.
 */
export function useScrollProgress(target?: RefObject<HTMLElement | null>): MotionValue<number> {
	const { scrollYProgress } = useScroll(
		target ? { target, offset: ['start end', 'end start'] } : undefined,
	);
	return useSpring(scrollYProgress, SPRING);
}

/** Hairline accent reading-progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
	const progress = useScrollProgress();
	const reduce = useReducedMotion();
	if (reduce) return null;
	return (
		<motion.div
			aria-hidden
			className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-accent"
			style={{ scaleX: progress }}
		/>
	);
}

'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_EXPO, EASE_OUT } from './easing';

const INITIAL = { opacity: 0, y: 18 } as const;
const ANIMATE = { opacity: 1, y: 0 } as const;
const TRANSITION = { duration: DURATION.base, ease: EASE_OUT, delay: 0.1 } as const;
const CURTAIN_INITIAL = { clipPath: 'inset(0% 0% 0% 0%)' } as const;
const CURTAIN_ANIMATE = { clipPath: 'inset(0% 0% 100% 0%)' } as const;
const CURTAIN_TRANSITION = { duration: DURATION.slow, ease: EASE_EXPO } as const;

/**
 * Enter transition for every route, mounted by app/template.tsx (re-mounted on
 * navigation): a cream page lifts off like a turned magazine leaf and the page
 * rises in. Reduced motion: `initial={false}` starts both at their end state —
 * the tree stays identical so hydration never mismatches.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
	const reduce = useReducedMotion();
	return (
		<>
			<motion.div
				aria-hidden
				data-page-curtain
				className="pointer-events-none fixed inset-0 z-[70] bg-cream"
				initial={reduce ? false : CURTAIN_INITIAL}
				animate={CURTAIN_ANIMATE}
				transition={CURTAIN_TRANSITION}
			>
				<div className="absolute inset-x-0 bottom-0 h-px bg-brass/60" />
			</motion.div>
			<motion.div data-page-transition initial={reduce ? false : INITIAL} animate={ANIMATE} transition={TRANSITION}>
				{children}
			</motion.div>
		</>
	);
}

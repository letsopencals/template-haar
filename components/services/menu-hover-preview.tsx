'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { SafeImage } from '@/components/ui/safe-image';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';

const FOLLOW = { stiffness: 220, damping: 26, mass: 0.6 } as const;
const IN = { opacity: 0, scale: 0.92, rotate: -3 };
const SHOWN = { opacity: 1, scale: 1, rotate: 0 };
const TRANSITION = { duration: 0.45, ease: EASE_OUT };

function useFinePointer(): boolean {
	const [fine, setFine] = useState(false);
	useEffect(() => {
		const mql = window.matchMedia('(pointer: fine) and (min-width: 1024px)');
		const update = () => setFine(mql.matches);
		update();
		mql.addEventListener('change', update);
		return () => mql.removeEventListener('change', update);
	}, []);
	return fine;
}

/**
 * Desktop-only (pointer: fine) arch plate that trails the cursor while a
 * collapsed menu row is hovered. Mobile and reduced motion get the inline plate
 * inside the expanded row instead.
 */
export function MenuHoverPreview({ src }: { src: string | null }) {
	const fine = useFinePointer();
	const reduce = useReducedMotion();
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const sx = useSpring(x, FOLLOW);
	const sy = useSpring(y, FOLLOW);
	const enabled = fine && !reduce;

	useEffect(() => {
		if (!enabled) return;
		const onMove = (e: PointerEvent) => {
			x.set(e.clientX + 32);
			y.set(e.clientY - 150);
		};
		window.addEventListener('pointermove', onMove, { passive: true });
		return () => window.removeEventListener('pointermove', onMove);
	}, [enabled, x, y]);

	if (!enabled) return null;

	return (
		<motion.div aria-hidden className="pointer-events-none fixed top-0 left-0 z-30" style={{ x: sx, y: sy }}>
			<AnimatePresence>
				{src ? (
					<motion.div
						key={src}
						initial={IN}
						animate={SHOWN}
						exit={IN}
						transition={TRANSITION}
						className="arch image-placeholder relative h-[18.75rem] w-[14rem] shadow-float"
					>
						<SafeImage src={src} alt="" fill sizes="224px" className="object-cover" />
					</motion.div>
				) : null}
			</AnimatePresence>
		</motion.div>
	);
}

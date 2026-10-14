'use client';

import { useCallback, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { clsx } from 'clsx';

const SPRING = { stiffness: 220, damping: 18, mass: 0.4 } as const;

export interface MagneticButtonProps {
	children: React.ReactNode;
	/** 0–1: how far the element follows the pointer. Default 0.3. */
	strength?: number;
	className?: string;
}

/**
 * Wrapper that pulls its child toward the pointer while hovered and springs
 * back on leave. Wrap a Button or a Link. Only active on fine pointers and
 * with motion allowed; otherwise it renders a plain inline-block.
 */
export function MagneticButton({ children, strength = 0.3, className }: MagneticButtonProps) {
	const ref = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();
	const x = useSpring(useMotionValue(0), SPRING);
	const y = useSpring(useMotionValue(0), SPRING);

	const onMove = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.pointerType !== 'mouse' || !ref.current) return;
			const r = ref.current.getBoundingClientRect();
			x.set((e.clientX - (r.left + r.width / 2)) * strength);
			y.set((e.clientY - (r.top + r.height / 2)) * strength);
		},
		[strength, x, y],
	);
	const onLeave = useCallback(() => {
		x.set(0);
		y.set(0);
	}, [x, y]);

	if (reduce) return <div className={clsx('inline-block', className)}>{children}</div>;

	return (
		<motion.div
			ref={ref}
			className={clsx('inline-block', className)}
			style={{ x, y }}
			onPointerMove={onMove}
			onPointerLeave={onLeave}
		>
			{children}
		</motion.div>
	);
}

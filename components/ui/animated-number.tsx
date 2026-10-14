'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';

interface AnimatedNumberProps {
	value: number;
	/** Formats each frame, e.g. a currency formatter. */
	format: (n: number) => string;
	className?: string;
}

/**
 * A live total that tweens from its previous value to the new one (unlike
 * CountUp, which plays once on entry). Writes to the DOM directly, so
 * frames don't re-render React. Reduced motion: jumps to the value.
 */
export function AnimatedNumber({ value, format, className }: AnimatedNumberProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const from = useRef(value);
	const reduce = useReducedMotion();

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (reduce || from.current === value) {
			el.textContent = format(value);
			from.current = value;
			return;
		}
		const controls = animate(from.current, value, {
			duration: 0.6,
			ease: EASE_OUT,
			onUpdate: (n) => {
				el.textContent = format(Math.round(n));
			},
			onComplete: () => {
				from.current = value;
			},
		});
		return () => {
			controls.stop();
			from.current = value;
		};
	}, [value, format, reduce]);

	return (
		<span ref={ref} className={className}>
			{format(value)}
		</span>
	);
}

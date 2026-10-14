'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useInView } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { clsx } from 'clsx';
import { DURATION, EASE_OUT } from './easing';

export interface CountUpProps {
	/** Final value. */
	value: number;
	/** Digits after the decimal point (e.g. 2.7 s → 1). Default 0. */
	decimals?: number;
	prefix?: string;
	suffix?: string;
	/** Seconds. Default 1.6. */
	duration?: number;
	/** Thousands separators via Intl (default true). */
	grouping?: boolean;
	className?: string;
}

/**
 * Counts from 0 to `value` the first time it scrolls into view, in the tabular
 * mono face so digits don't jitter. Reduced motion: shows the final value.
 * The final value is server-rendered, so no-JS and crawlers see the real number.
 */
export function CountUp({
	value,
	decimals = 0,
	prefix = '',
	suffix = '',
	duration = DURATION.slow + 0.5,
	grouping = true,
	className,
}: CountUpProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
	const reduce = useReducedMotion();
	const [display, setDisplay] = useState<number>(value);
	const started = useRef(false);

	useEffect(() => {
		if (reduce || started.current) return;
		// Reset to 0 only once mounted on the client, then animate when in view.
		if (!inView) {
			setDisplay(0);
			return;
		}
		started.current = true;
		const controls = animate(0, value, { duration, ease: EASE_OUT, onUpdate: setDisplay });
		return () => controls.stop();
	}, [inView, reduce, value, duration]);

	const formatted = display.toLocaleString('en-US', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
		useGrouping: grouping,
	});

	return (
		<span ref={ref} className={clsx('tabular', className)}>
			{prefix}
			{formatted}
			{suffix}
		</span>
	);
}

'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';

const OFFSET = ['start end', 'end start'] as const;

export interface ParallaxImageProps {
	src: string;
	alt: string;
	className?: string;
	/** Max vertical travel as a % of the container height (each direction). Default 10. */
	strength?: number;
	priority?: boolean;
	sizes?: string;
	/** Extra classes on the <img> (e.g. object-position). */
	imageClassName?: string;
	children?: React.ReactNode;
}

/**
 * Image that drifts slower than the page as it scrolls through the viewport.
 * The container must have a size (aspect-* or h-*). Falls back to a plaster
 * gradient if the file is missing. Reduced motion: static image.
 */
export function ParallaxImage({
	src,
	alt,
	className,
	strength = 10,
	priority,
	sizes = '100vw',
	imageClassName,
	children,
}: ParallaxImageProps) {
	const ref = useRef<HTMLDivElement>(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({ target: ref, offset: [...OFFSET] });
	const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

	return (
		<div ref={ref} className={clsx('relative overflow-hidden image-placeholder', className)}>
			<motion.div
				className="absolute inset-x-0"
				style={
					reduce
						? { top: 0, bottom: 0 }
						: { y, top: `-${strength}%`, bottom: `-${strength}%` }
				}
			>
				<SafeImage src={src} alt={alt} fill priority={priority} sizes={sizes} className={clsx('object-cover', imageClassName)} />
			</motion.div>
			{children}
		</div>
	);
}

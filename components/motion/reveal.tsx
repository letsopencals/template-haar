'use client';

import { motion, type Variants } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { clsx } from 'clsx';
import { DURATION, EASE_OUT, VIEWPORT_ONCE } from './easing';

/* ------------------------------------------------------------------ Reveal */

const FADE_UP: Variants = {
	hidden: { opacity: 0, y: 28 },
	visible: (delay: number) => ({
		opacity: 1,
		y: 0,
		transition: { duration: DURATION.base, ease: EASE_OUT, delay },
	}),
};
const FADE_ONLY: Variants = {
	hidden: { opacity: 0 },
	visible: (delay: number) => ({ opacity: 1, transition: { duration: DURATION.fast, delay } }),
};

export interface RevealProps {
	children: React.ReactNode;
	className?: string;
	/** Seconds. */
	delay?: number;
	as?: 'div' | 'section' | 'li' | 'span' | 'p';
}

/** Fade + rise on first entry into the viewport. Reduced motion: opacity only. */
export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
	const reduce = useReducedMotion();
	const Comp = motion[as];
	return (
		<Comp
			className={className}
			variants={reduce ? FADE_ONLY : FADE_UP}
			initial="hidden"
			whileInView="visible"
			viewport={VIEWPORT_ONCE}
			custom={delay}
		>
			{children}
		</Comp>
	);
}

/* -------------------------------------------------------------- RevealText */

const LINE: Variants = {
	hidden: { y: '110%' },
	visible: (i: number) => ({
		y: '0%',
		transition: { duration: DURATION.slow, ease: EASE_OUT, delay: i },
	}),
};

export interface RevealTextProps {
	/** Text to reveal. Use `\n` for line breaks — each line is masked separately. */
	text: string;
	className?: string;
	/** Class on each line wrapper (e.g. `pb-1` so descenders aren't clipped). */
	lineClassName?: string;
	/** Seconds before the first line. */
	delay?: number;
	/** Seconds between lines. */
	stagger?: number;
	as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
	/** 'inView' (default) reveals on scroll; 'mount' reveals immediately (heroes). */
	trigger?: 'inView' | 'mount';
}

/**
 * Line-mask text reveal: each line slides up from behind an overflow mask.
 * Reduced motion: renders static text. The full string stays in the DOM for SEO
 * and screen readers (lines are aria-hidden duplicates of an sr-only copy).
 */
export function RevealText({
	text,
	className,
	lineClassName,
	delay = 0,
	stagger = 0.09,
	as = 'div',
	trigger = 'inView',
}: RevealTextProps) {
	const reduce = useReducedMotion();
	const Tag = as;
	const lines = text.split('\n');

	if (reduce) {
		return (
			<Tag className={className}>
				{lines.map((line, i) => (
					<span key={i} className="block">
						{line}
					</span>
				))}
			</Tag>
		);
	}

	const play = trigger === 'mount' ? { animate: 'visible' } : { whileInView: 'visible', viewport: VIEWPORT_ONCE };

	return (
		<Tag className={className}>
			<span className="sr-only">{text.replace(/\n/g, ' ')}</span>
			<motion.span aria-hidden className="block" initial="hidden" {...play}>
				{lines.map((line, i) => (
					<span key={i} className={clsx('block overflow-hidden', lineClassName)}>
						<motion.span className="block will-change-transform" variants={LINE} custom={delay + i * stagger}>
							{line || ' '}
						</motion.span>
					</span>
				))}
			</motion.span>
		</Tag>
	);
}

/* ------------------------------------------------------------- RevealImage */

const CLIP_FROM = {
	up: 'inset(100% 0% 0% 0%)',
	down: 'inset(0% 0% 100% 0%)',
	left: 'inset(0% 0% 0% 100%)',
	right: 'inset(0% 100% 0% 0%)',
} as const;

const CLIP_VISIBLE = 'inset(0% 0% 0% 0%)';
const IMAGE_TRANSITION = { duration: DURATION.drive, ease: EASE_OUT } as const;

export interface RevealImageProps {
	children: React.ReactNode;
	className?: string;
	/** Direction the image wipes in from. */
	from?: keyof typeof CLIP_FROM;
	delay?: number;
}

/**
 * Clip-path wipe + slow settle (scale 1.15 → 1) for an image container. Put a
 * `SafeImage` (or any fill image) inside. Reduced motion: no wipe.
 */
export function RevealImage({ children, className, from = 'up', delay = 0 }: RevealImageProps) {
	const reduce = useReducedMotion();
	if (reduce) return <div className={clsx('relative overflow-hidden', className)}>{children}</div>;

	return (
		<motion.div
			className={clsx('relative overflow-hidden', className)}
			initial={{ clipPath: CLIP_FROM[from] }}
			whileInView={{ clipPath: CLIP_VISIBLE }}
			viewport={VIEWPORT_ONCE}
			transition={{ ...IMAGE_TRANSITION, delay }}
		>
			<motion.div
				className="absolute inset-0"
				initial={{ scale: 1.15 }}
				whileInView={{ scale: 1 }}
				viewport={VIEWPORT_ONCE}
				transition={{ ...IMAGE_TRANSITION, duration: DURATION.drive + 0.4, delay }}
			>
				{children}
			</motion.div>
		</motion.div>
	);
}

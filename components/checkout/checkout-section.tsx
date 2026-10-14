'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';

export type SectionState = 'locked' | 'open' | 'done';

interface CheckoutSectionProps {
	id: string;
	/** "01", "02"… */
	index: string;
	title: ReactNode;
	state: SectionState;
	/** One-line recap shown once the section is done. */
	summary?: ReactNode;
	/** Shown under the dimmed title while locked. */
	lockedHint?: string;
	/** Re-open a done section. */
	onEdit?: () => void;
	children: ReactNode;
}

const BODY_INITIAL = { height: 0, opacity: 0 };
const BODY_ANIMATE = { height: 'auto', opacity: 1 };
const BODY_TRANSITION: Transition = {
	height: { duration: 0.7, ease: EASE_OUT },
	opacity: { duration: 0.45, ease: EASE_OUT, delay: 0.1 },
};
const NO_TRANSITION: Transition = { duration: 0 };

/**
 * One numbered checkout step, in the composer's unlock/recap rhythm: locked
 * steps sit dimmed with a hint, the open step unfolds, done steps fold to a
 * one-line recap with an Edit link.
 */
export function CheckoutSection({ id, index, title, state, summary, lockedHint, onEdit, children }: CheckoutSectionProps) {
	const reduce = useReducedMotion();
	const open = state === 'open';
	const locked = state === 'locked';

	return (
		<section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-32 border-t border-line py-9 sm:py-11">
			<header className="flex items-baseline gap-4 sm:gap-6">
				<span
					className={clsx(
						'tabular w-7 shrink-0 text-sm transition-colors duration-500',
						locked ? 'text-warm-gray-light' : open ? 'text-accent' : 'text-brass',
					)}
				>
					{index}
				</span>
				<div className="min-w-0 flex-1">
					<h2
						id={`${id}-title`}
						className={clsx(
							'font-display text-[clamp(1.6rem,2.6vw,2.25rem)] leading-[1.05] tracking-[-0.02em] transition-colors duration-500',
							locked ? 'text-warm-gray-light' : 'text-charcoal',
						)}
					>
						{title}
					</h2>
					{state === 'done' && summary ? <p className="mt-2 truncate text-sm text-warm-gray">{summary}</p> : null}
					{locked && lockedHint ? <p className="mt-2 text-sm text-warm-gray-light">{lockedHint}</p> : null}
				</div>
				{state === 'done' && onEdit ? (
					<button
						type="button"
						onClick={onEdit}
						className="eyebrow link-underline shrink-0 text-charcoal hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
					>
						Edit<span className="sr-only"> {typeof title === 'string' ? title : 'this step'}</span>
					</button>
				) : (
					<StateMark state={state} />
				)}
			</header>

			<AnimatePresence initial={false}>
				{open ? (
					<motion.div
						key="body"
						initial={reduce ? false : BODY_INITIAL}
						animate={BODY_ANIMATE}
						exit={reduce ? undefined : BODY_INITIAL}
						transition={reduce ? NO_TRANSITION : BODY_TRANSITION}
						className="overflow-hidden"
					>
						{/* Padding inside the animated box keeps focus rings visible. */}
						<div data-section-body className="px-px pt-8 pb-1 sm:pl-[3.25rem]">{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</section>
	);
}

function StateMark({ state }: { state: SectionState }) {
	if (state === 'locked') {
		return <span className="h-px w-6 shrink-0 translate-y-[-0.35em] bg-line-strong" aria-label="Not yet" />;
	}
	if (state === 'done') {
		return (
			<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brass text-brass" aria-label="Done">
				<svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
					<path d="M3 8.5l3.2 3L13 4.5" />
				</svg>
			</span>
		);
	}
	return <span className="h-2 w-2 shrink-0 translate-y-[-0.3em] rounded-full bg-accent" aria-label="Current step" />;
}

'use client';

import { forwardRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';

export type SectionState = 'locked' | 'open' | 'done';

const BODY_INITIAL = { height: 0, opacity: 0 };
const BODY_ANIMATE = { height: 'auto', opacity: 1 };
const BODY_EXIT = { height: 0, opacity: 0 };
const BODY_TRANSITION = { height: { duration: 0.7, ease: EASE_OUT }, opacity: { duration: 0.45, ease: EASE_OUT } };
const NO_TRANSITION = { duration: 0 };

interface BookSectionProps {
	id: string;
	index: number;
	title: string;
	state: SectionState;
	/** One-line recap when done, e.g. "Full · New York". */
	summary?: React.ReactNode;
	/** Shown dimmed while locked, e.g. "Choose a stylist first". */
	lockedHint?: string;
	onEdit?: () => void;
	children: React.ReactNode;
}

/**
 * A numbered line on the consultation card. Locked: dimmed and inert. Open:
 * the body grows in. Done: collapses to a one-line recap with "Edit".
 */
export const BookSection = forwardRef<HTMLElement, BookSectionProps>(function BookSection(
	{ id, index, title, state, summary, lockedHint, onEdit, children },
	ref,
) {
	const reduce = useReducedMotion();
	const headingId = `${id}-title`;
	const number = String(index + 1).padStart(2, '0');

	return (
		<section
			ref={ref}
			id={id}
			aria-labelledby={headingId}
			className={clsx('scroll-mt-28 border-t border-line-strong py-8 md:py-10', state === 'locked' && 'opacity-40')}
			inert={state === 'locked' ? true : undefined}
		>
			<div className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-baseline gap-x-3 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:gap-x-5">
				<span className="tabular text-sm text-brass">{number}</span>
				<div className="min-w-0">
					<h2 id={headingId} className="font-display text-[1.75rem] leading-tight text-charcoal md:text-[2rem]">
						{title}
					</h2>
					{state === 'done' && summary ? (
						<p className="mt-1 truncate text-sm text-warm-gray">{summary}</p>
					) : state === 'locked' && lockedHint ? (
						<p className="mt-1 text-sm text-warm-gray">{lockedHint}</p>
					) : null}
				</div>
				{state === 'done' && onEdit ? (
					<button
						type="button"
						onClick={onEdit}
						className="link-underline eyebrow text-charcoal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
					>
						Edit<span className="sr-only"> {title.toLowerCase()}</span>
					</button>
				) : (
					<StateMark state={state} />
				)}
			</div>

			<AnimatePresence initial={false}>
				{state === 'open' ? (
					<motion.div
						key="body"
						initial={reduce ? false : BODY_INITIAL}
						animate={BODY_ANIMATE}
						exit={reduce ? undefined : BODY_EXIT}
						transition={reduce ? NO_TRANSITION : BODY_TRANSITION}
						className="overflow-hidden"
					>
						<div className="pt-7 sm:pl-[4.25rem]">{children}</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</section>
	);
});

function StateMark({ state }: { state: SectionState }) {
	if (state === 'locked') {
		return (
			<svg className="h-4 w-4 text-warm-gray" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.2} aria-hidden>
				<rect x="3.5" y="7" width="9" height="6.5" />
				<path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
			</svg>
		);
	}
	return <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />;
}

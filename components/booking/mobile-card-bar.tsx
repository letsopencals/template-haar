'use client';

import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useHydrated } from '@/hooks/use-hydrated';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { EASE_EXPO } from '@/components/motion/easing';
import { formatPrice } from '@/lib/format';

const SHEET_IN = { y: '100%' };
const SHEET_SHOWN = { y: 0 };
const SHEET_TRANSITION = { duration: 0.6, ease: EASE_EXPO };
const VEIL_IN = { opacity: 0 };
const VEIL_SHOWN = { opacity: 1 };
const NO_TRANSITION = { duration: 0 };

interface MobileCardBarProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	total: number;
	currency: string;
	/** Short state line, e.g. "Still to choose: a time" or "Ready to reserve". */
	status: string;
	held: boolean;
	children: React.ReactNode;
}

/**
 * Below lg: a sticky bar ("Your card · $85 ▴") that opens the appointment card
 * in a bottom sheet. Portaled to <body> so PageTransition's transform doesn't
 * trap the fixed positioning.
 */
export function MobileCardBar({ open, onOpenChange, total, currency, status, held, children }: MobileCardBarProps) {
	const hydrated = useHydrated();
	const lenis = useSmoothScroll();
	const reduce = useReducedMotion();
	const sheetRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const formatMoney = useCallback((cents: number) => formatPrice(cents / 100, currency), [currency]);
	const close = useCallback(() => onOpenChange(false), [onOpenChange]);

	useEffect(() => {
		if (!open) return;
		lenis?.stop();
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		const trigger = triggerRef.current;
		const focusTimer = window.setTimeout(() => sheetRef.current?.focus(), 50);
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close();
		};
		window.addEventListener('keydown', onKey);
		// Leaving lg-down (rotate / resize) closes the sheet.
		const mql = window.matchMedia('(min-width: 1024px)');
		const onMql = () => mql.matches && close();
		mql.addEventListener('change', onMql);
		return () => {
			window.clearTimeout(focusTimer);
			window.removeEventListener('keydown', onKey);
			mql.removeEventListener('change', onMql);
			document.body.style.overflow = prevOverflow;
			lenis?.start();
			trigger?.focus();
		};
	}, [open, lenis, close]);

	if (!hydrated) return null;

	return createPortal(
		<div className="lg:hidden">
			<div className="fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
				<button
					ref={triggerRef}
					type="button"
					onClick={() => onOpenChange(!open)}
					aria-expanded={open}
					aria-controls="mobile-card-sheet"
					className="container-x flex w-full items-center justify-between gap-4 py-3.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
				>
					<span className="min-w-0">
						<span className="flex items-baseline gap-2">
							<span className="font-display text-lg text-charcoal">{held ? 'Held for you' : 'Your card'}</span>
							<span aria-hidden className="text-warm-gray">·</span>
							<AnimatedNumber value={Math.round(total * 100)} format={formatMoney} className="tabular text-base text-charcoal" />
						</span>
						<span className="block truncate text-xs text-warm-gray">{status}</span>
					</span>
					<span className="eyebrow flex shrink-0 items-center gap-2 border border-charcoal px-3 py-2 text-[0.6rem] text-charcoal">
						{open ? 'Close' : 'View card'}
						<svg className={`h-3 w-3 transition-transform duration-500 ${open ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
							<path d="M2.5 7.5L6 4l3.5 3.5" strokeLinecap="square" />
						</svg>
					</span>
				</button>
			</div>

			<AnimatePresence>
				{open ? (
					<>
						<motion.div
							key="veil"
							className="fixed inset-0 z-40 bg-charcoal/50"
							initial={reduce ? false : VEIL_IN}
							animate={VEIL_SHOWN}
							exit={reduce ? undefined : VEIL_IN}
							transition={reduce ? NO_TRANSITION : SHEET_TRANSITION}
							onClick={close}
							aria-hidden
						/>
						<motion.div
							key="sheet"
							id="mobile-card-sheet"
							ref={sheetRef}
							role="dialog"
							aria-modal="true"
							aria-label="Your appointment card"
							tabIndex={-1}
							data-lenis-prevent
							className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto overscroll-contain bg-paper px-4 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] focus:outline-none sm:px-8"
							initial={reduce ? false : SHEET_IN}
							animate={SHEET_SHOWN}
							exit={reduce ? undefined : SHEET_IN}
							transition={reduce ? NO_TRANSITION : SHEET_TRANSITION}
						>
							<div className="mb-4 flex items-center justify-between">
								<span className="mx-auto h-1 w-10 rounded-full bg-line-strong" aria-hidden />
							</div>
							<div className="mb-4 flex justify-end">
								<button type="button" onClick={close} className="link-underline eyebrow text-[0.62rem] text-charcoal">
									Close
								</button>
							</div>
							<div className="mx-auto max-w-md">{children}</div>
						</motion.div>
					</>
				) : null}
			</AnimatePresence>
		</div>,
		document.body,
	);
}

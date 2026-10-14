'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';
import { DURATION, EASE_OUT } from '@/components/motion/easing';

const BACKDROP_IN = { opacity: 1 } as const;
const BACKDROP_OUT = { opacity: 0 } as const;
const PANEL_FROM = { opacity: 0, y: 28 } as const;
const PANEL_TO = { opacity: 1, y: 0 } as const;
const PANEL_FADE = { opacity: 0 } as const;
const TRANSITION = { duration: DURATION.fast, ease: EASE_OUT } as const;

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ModalProps {
	open: boolean;
	onClose: () => void;
	/** Masthead line, e.g. "Nº 02 — Reschedule". */
	eyebrow?: string;
	title: React.ReactNode;
	description?: React.ReactNode;
	children: React.ReactNode;
	/** Sticky action row at the bottom of the sheet. */
	footer?: React.ReactNode;
	size?: 'md' | 'lg';
	/** Block Esc / backdrop close (e.g. while a request is in flight). */
	busy?: boolean;
}

/**
 * Paper sheet over a charcoal veil. Portalled to <body> (the page transition
 * wrapper has a transform, which would trap `position: fixed`). Traps focus,
 * closes on Esc and backdrop click, pauses Lenis and restores focus on close.
 * A bottom sheet on phones, a centred card from `sm`.
 */
export function Modal({ open, onClose, eyebrow, title, description, children, footer, size = 'md', busy = false }: ModalProps) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	if (!mounted) return null;
	return createPortal(
		<AnimatePresence>
			{open ? (
				<ModalSheet
					onClose={onClose}
					eyebrow={eyebrow}
					title={title}
					description={description}
					footer={footer}
					size={size}
					busy={busy}
				>
					{children}
				</ModalSheet>
			) : null}
		</AnimatePresence>,
		document.body,
	);
}

function ModalSheet({
	onClose,
	eyebrow,
	title,
	description,
	children,
	footer,
	size,
	busy,
}: Omit<ModalProps, 'open'>) {
	const reduce = useReducedMotion();
	const lenis = useSmoothScroll();
	const panelRef = useRef<HTMLDivElement>(null);
	const titleId = useId();
	const descId = useId();

	// Keep the latest close handler / busy flag without re-binding listeners.
	const closeRef = useRef(onClose);
	const busyRef = useRef(busy);
	useEffect(() => {
		closeRef.current = onClose;
		busyRef.current = busy;
	});

	// Scroll lock + Lenis pause + focus restore.
	useEffect(() => {
		const previous = document.activeElement as HTMLElement | null;
		const { overflow } = document.body.style;
		document.body.style.overflow = 'hidden';
		lenis?.stop();

		const panel = panelRef.current;
		const first = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? panel?.querySelector<HTMLElement>(FOCUSABLE);
		(first ?? panel)?.focus();

		return () => {
			document.body.style.overflow = overflow;
			lenis?.start();
			previous?.focus?.();
		};
	}, [lenis]);

	// Esc + focus trap.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				if (!busyRef.current) {
					e.stopPropagation();
					closeRef.current();
				}
				return;
			}
			if (e.key !== 'Tab' || !panelRef.current) return;
			const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
				(n) => n.offsetParent !== null,
			);
			if (nodes.length === 0) {
				e.preventDefault();
				return;
			}
			const first = nodes[0]!;
			const last = nodes[nodes.length - 1]!;
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, []);

	return (
		<div className="fixed inset-0 z-[75] flex items-end justify-center sm:items-center sm:p-6" data-lenis-prevent>
			<motion.div
				aria-hidden
				className="absolute inset-0 bg-charcoal/55 backdrop-blur-[2px]"
				initial={BACKDROP_OUT}
				animate={BACKDROP_IN}
				exit={BACKDROP_OUT}
				transition={TRANSITION}
				onClick={() => {
					if (!busy) onClose();
				}}
			/>
			<motion.div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={description ? descId : undefined}
				tabIndex={-1}
				initial={reduce ? PANEL_FADE : PANEL_FROM}
				animate={PANEL_TO}
				exit={reduce ? PANEL_FADE : PANEL_FROM}
				transition={TRANSITION}
				className={clsx(
					'grain relative flex max-h-[92svh] w-full flex-col bg-paper shadow-[0_30px_80px_-30px_rgba(28,25,23,0.45)] outline-none',
					size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg',
				)}
			>
				<header className="relative z-[2] border-b border-line px-6 pt-6 pb-5 sm:px-8 sm:pt-8">
					<div className="flex items-start justify-between gap-6">
						<div className="min-w-0">
							{eyebrow ? <p className="eyebrow text-brass">{eyebrow}</p> : null}
							<h2 id={titleId} className="display-sm mt-3 text-charcoal [&_em]:text-accent">
								{title}
							</h2>
						</div>
						<button
							type="button"
							onClick={onClose}
							disabled={busy}
							aria-label="Close"
							className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center text-warm-gray transition-colors hover:text-charcoal focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
						>
							<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden>
								<path d="M6 6l12 12M18 6L6 18" />
							</svg>
						</button>
					</div>
					{description ? (
						<p id={descId} className="mt-3 text-sm leading-relaxed text-warm-gray">
							{description}
						</p>
					) : null}
				</header>

				<div className="relative z-[2] min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8" data-lenis-prevent>
					{children}
				</div>

				{footer ? (
					<footer className="relative z-[2] flex flex-col-reverse gap-3 border-t border-line px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
						{footer}
					</footer>
				) : null}
			</motion.div>
		</div>
	);
}

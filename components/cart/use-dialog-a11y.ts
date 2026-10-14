'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal-dialog behaviour for an overlay panel: moves focus in on open, traps
 * Tab inside, closes on Escape, restores focus on close, and pauses page
 * scrolling (Lenis + body overflow) while open.
 */
export function useDialogA11y(panelRef: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
	const lenis = useSmoothScroll();
	// Callers often pass an inline arrow; read it through a ref so a parent
	// re-render doesn't re-run the effect (and yank focus back to the top).
	const closeRef = useRef(onClose);
	useEffect(() => {
		closeRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		if (!open) return;
		const previous = document.activeElement as HTMLElement | null;
		const panel = panelRef.current;
		// Focus the first control (the close button) once the panel is mounted.
		const raf = requestAnimationFrame(() => {
			const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
			(first ?? panel)?.focus({ preventScroll: true });
		});

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				closeRef.current();
				return;
			}
			if (e.key !== 'Tab' || !panel) return;
			const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null);
			if (nodes.length === 0) {
				e.preventDefault();
				return;
			}
			const first = nodes[0]!;
			const last = nodes[nodes.length - 1]!;
			if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', onKey);
		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		lenis?.stop();

		return () => {
			cancelAnimationFrame(raf);
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = overflow;
			lenis?.start();
			previous?.focus?.({ preventScroll: true });
		};
	}, [open, panelRef, lenis]);
}

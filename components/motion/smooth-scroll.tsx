'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

const SmoothScrollContext = createContext<Lenis | null>(null);

const LENIS_OPTIONS = {
	lerp: 0.1,
	wheelMultiplier: 0.9,
	autoRaf: true,
	anchors: true,
	// Let nested scrollers (drawers, modals, horizontal carousels) scroll natively.
	prevent: (node: HTMLElement) => node.closest('[data-lenis-prevent]') !== null,
} as const;

/**
 * Lenis smooth scrolling for the whole page. Disabled entirely when the user
 * prefers reduced motion (native scrolling, no inertia). Resets to the top on
 * route change. Read the instance with `useSmoothScroll()` (null when off) —
 * e.g. the menu overlay calls `lenis?.stop()` while open.
 *
 * Mark any element that should keep native scroll with `data-lenis-prevent`.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
	const [lenis, setLenis] = useState<Lenis | null>(null);
	const pathname = usePathname();

	useEffect(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		let instance: Lenis | null = null;

		const start = () => {
			if (media.matches || instance) return;
			instance = new Lenis(LENIS_OPTIONS);
			setLenis(instance);
		};
		const stop = () => {
			instance?.destroy();
			instance = null;
			setLenis(null);
		};
		const onChange = () => (media.matches ? stop() : start());

		start();
		media.addEventListener('change', onChange);
		return () => {
			media.removeEventListener('change', onChange);
			stop();
		};
	}, []);

	useEffect(() => {
		lenis?.scrollTo(0, { immediate: true });
	}, [pathname, lenis]);

	const value = useMemo(() => lenis, [lenis]);
	return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}

/** The active Lenis instance, or null (reduced motion / not mounted yet). */
export function useSmoothScroll(): Lenis | null {
	return useContext(SmoothScrollContext);
}

'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
	const mql = window.matchMedia(QUERY);
	mql.addEventListener('change', onChange);
	return () => mql.removeEventListener('change', onChange);
}

/**
 * Hydration-safe `prefers-reduced-motion`. framer-motion's `useReducedMotion`
 * reads the media query on the client's first render but is null on the server,
 * so components that render a different tree for reduced motion fail to hydrate.
 * This returns false while hydrating (matching the server) and the real value
 * right after.
 */
export function useReducedMotion(): boolean {
	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(QUERY).matches,
		() => false,
	);
}

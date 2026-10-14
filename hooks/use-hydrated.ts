'use client';

import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/**
 * False on the server and while hydrating, true afterwards. Use it to switch
 * from a server-stable value (e.g. the school's timezone) to a browser-only one
 * (the visitor's timezone) without a hydration mismatch.
 */
export function useHydrated(): boolean {
	return useSyncExternalStore(
		noop,
		() => true,
		() => false,
	);
}

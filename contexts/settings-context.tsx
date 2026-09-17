'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { StorePublicSettings } from '@opencals/storefront-sdk';

interface SettingsContextValue {
	settings: StorePublicSettings | null;
	currency: string;
	timeFormat: '12H' | '24H';
	dateFormat: string;
	loading: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
	settings: null,
	currency: 'USD',
	timeFormat: '12H',
	dateFormat: 'MM/DD/YYYY',
	loading: true,
});

export function SettingsProvider({
	children,
	initialSettings = null,
}: {
	children: ReactNode;
	initialSettings?: StorePublicSettings | null;
}) {
	// Settings are fetched on the server and passed in, so there's no loading
	// flash and no client fetch on mount. Value is memoized to keep the context
	// stable across parent re-renders.
	const value = useMemo<SettingsContextValue>(
		() => ({
			settings: initialSettings,
			currency: initialSettings?.currency ?? 'USD',
			timeFormat: initialSettings?.settings?.timeFormat ?? '12H',
			dateFormat: initialSettings?.settings?.dateFormat ?? 'MM/DD/YYYY',
			loading: false,
		}),
		[initialSettings],
	);

	return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
	return useContext(SettingsContext);
}

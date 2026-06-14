'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
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

export function SettingsProvider({ children }: { children: ReactNode }) {
	const [settings, setSettings] = useState<StorePublicSettings | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch('/api/store/settings')
			.then((res) => (res.ok ? res.json() : null))
			.then((data: StorePublicSettings | null) => {
				if (data) setSettings(data);
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	const currency = settings?.currency ?? 'USD';
	const timeFormat = settings?.settings?.timeFormat ?? '12H';
	const dateFormat = settings?.settings?.dateFormat ?? 'MM/DD/YYYY';

	return (
		<SettingsContext.Provider value={{ settings, currency, timeFormat, dateFormat, loading }}>
			{children}
		</SettingsContext.Provider>
	);
}

export function useSettings() {
	return useContext(SettingsContext);
}

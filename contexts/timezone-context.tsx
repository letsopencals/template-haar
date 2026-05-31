'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import moment from 'moment-timezone';

const TIMEZONE_COOKIE = '@opencals/timezone';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

interface TimezoneContextValue {
	timezone: string;
	setTimezone: (timezone: string) => void;
}

const TimezoneContext = createContext<TimezoneContextValue | undefined>(undefined);

export function TimezoneProvider({ children }: { children: ReactNode }) {
	const [timezone, setTimezone] = useState<string>(() => moment.tz.guess());

	useEffect(() => {
		if (typeof document === 'undefined') return;

		const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
		const secureSuffix = isSecure ? '; secure' : '';

		if (timezone) {
			document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(timezone)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax${secureSuffix}`;
		}
	}, [timezone]);

	return <TimezoneContext.Provider value={{ timezone, setTimezone }}>{children}</TimezoneContext.Provider>;
}

export function useTimezone(): TimezoneContextValue {
	const ctx = useContext(TimezoneContext);
	if (!ctx) {
		throw new Error('useTimezone must be used within TimezoneProvider');
	}
	return ctx;
}

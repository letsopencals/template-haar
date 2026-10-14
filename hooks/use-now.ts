'use client';

import { useEffect, useState } from 'react';

/**
 * The current time, refreshed every `intervalMs`. Null on the server and while
 * hydrating, so time-dependent UI ("Open today until 20:00", today's row in a
 * timetable) renders neutral markup first and never mismatches.
 */
export function useNow(intervalMs = 60_000): Date | null {
	const [now, setNow] = useState<Date | null>(null);
	useEffect(() => {
		setNow(new Date());
		const id = window.setInterval(() => setNow(new Date()), intervalMs);
		return () => window.clearInterval(id);
	}, [intervalMs]);
	return now;
}

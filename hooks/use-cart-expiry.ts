'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Derives a live "seconds remaining" countdown from a cart's expiresAt.
 * Returns null when there's no expiration. Split out of cart-context so the
 * context owns cart state and this hook owns the ticking timer.
 */
export function useCartExpiry(expiresAt: string | null | undefined): number | null {
	const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		if (timerRef.current) clearInterval(timerRef.current);

		if (!expiresAt) {
			setTimeRemaining(null);
			return;
		}

		const target = new Date(expiresAt).getTime();
		function tick() {
			const remaining = Math.max(0, Math.floor((target - Date.now()) / 1000));
			setTimeRemaining(remaining);
			if (remaining <= 0 && timerRef.current) clearInterval(timerRef.current);
		}

		tick();
		timerRef.current = setInterval(tick, 1000);

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [expiresAt]);

	return timeRemaining;
}

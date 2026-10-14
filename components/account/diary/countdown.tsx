'use client';

import { memo } from 'react';
import { useNow } from '@/hooks/use-now';
import { formatCountdown } from '@/components/account/appointment-utils';

/** Live "in 3 days, 4 h" for the next visit. Renders nothing until hydrated. */
export const Countdown = memo(function Countdown({ from, className }: { from: string; className?: string }) {
	const now = useNow(30_000);
	if (!now) return <span className={className} aria-hidden>&nbsp;</span>;
	return (
		<span className={className} aria-live="polite">
			{formatCountdown(new Date(from).getTime(), now.getTime())}
		</span>
	);
});

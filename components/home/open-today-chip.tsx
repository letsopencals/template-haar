'use client';

import { memo, useMemo } from 'react';
import { clsx } from 'clsx';
import { siteConfig } from '@/lib/site-config';
import { formatClock, openStateAt, parseOpeningHours, type OpenState } from '@/lib/opening-hours';
import { useNow } from '@/hooks/use-now';
import { useSettings } from '@/contexts/settings-context';

const WEEK = parseOpeningHours(siteConfig.contact.hours);

function label(state: OpenState, timeFormat: '12H' | '24H'): string {
	if (state.kind === 'open') return `Open today until ${formatClock(state.until, timeFormat)}`;
	if (state.kind === 'later') return `Opens today at ${formatClock(state.from, timeFormat)}`;
	if (state.next?.open != null) return `Closed · opens ${state.next.short} ${formatClock(state.next.open, timeFormat)}`;
	return 'Closed today';
}

/**
 * "Open today until 20:00" pill computed from `siteConfig.contact.hours` on the
 * visitor's clock. Server/hydration render a neutral "Open six days a week"
 * line, then the live state swaps in after mount.
 */
export const OpenTodayChip = memo(function OpenTodayChip({ className, tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
	const now = useNow();
	const { timeFormat } = useSettings();
	const state = useMemo(() => (now ? openStateAt(WEEK, now) : null), [now]);
	const open = state?.kind === 'open';

	return (
		<span
			className={clsx(
				'inline-flex items-center gap-2 border px-3 py-1.5 text-[0.7rem] tracking-[0.04em]',
				tone === 'light' ? 'border-line bg-paper/70 text-charcoal' : 'border-white/15 text-white/80',
				className,
			)}
		>
			<span className="relative flex h-1.5 w-1.5" aria-hidden>
				{open ? <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" /> : null}
				<span className={clsx('relative h-1.5 w-1.5 rounded-full', open ? 'bg-accent' : 'bg-warm-gray-light')} />
			</span>
			<span className="tabular" aria-live="polite">
				{state ? label(state, timeFormat) : 'Open seven days a week'}
			</span>
		</span>
	);
});

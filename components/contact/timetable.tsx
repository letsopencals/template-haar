'use client';

import { memo, useMemo } from 'react';
import { clsx } from 'clsx';
import { useNow } from '@/hooks/use-now';
import { useSettings } from '@/contexts/settings-context';
import { formatClock, parseOpeningHours, WEEK_ORDER } from '@/lib/opening-hours';
import { siteConfig } from '@/lib/site-config';

const WEEK = parseOpeningHours(siteConfig.contact.hours);

/**
 * Weekly hours. "Today" is only highlighted after mount (the server can't know
 * the visitor's weekday), so the server and first client render match.
 */
export const Timetable = memo(function Timetable() {
	const now = useNow();
	const { timeFormat } = useSettings();
	const today = now ? now.getDay() : null;
	const rows = useMemo(() => WEEK_ORDER.map((d) => WEEK[d]!), []);

	return (
		<table className="w-full border-collapse text-[15px]">
			<caption className="sr-only">Opening hours</caption>
			<tbody>
				{rows.map((row) => {
					const isToday = row.day === today;
					return (
						<tr
							key={row.day}
							aria-current={isToday ? 'date' : undefined}
							className={clsx('border-b border-line transition-colors duration-500', isToday ? 'bg-cream' : null)}
						>
							<th scope="row" className="py-3.5 pl-3 text-left font-normal">
								<span className={clsx('font-display text-lg', isToday ? 'italic text-accent' : 'text-charcoal')}>{row.label}</span>
								{isToday ? <span className="eyebrow ml-3 text-accent">Today</span> : null}
							</th>
							<td className="tabular py-3.5 pr-3 text-right text-charcoal/70">
								{row.open !== null && row.close !== null
									? `${formatClock(row.open, timeFormat)} — ${formatClock(row.close, timeFormat)}`
									: 'Closed'}
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
});

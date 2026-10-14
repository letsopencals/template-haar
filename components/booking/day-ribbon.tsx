'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { SPRING_SOFT } from '@/components/motion/easing';
import { plusDays, todayIn } from './slot-time';

export interface DayRibbonProps {
	/** Selected day, YYYY-MM-DD (in `timezone`). */
	selected: string | null;
	onSelect: (date: string) => void;
	/** Open days. `null` = unknown (still loading) → every day is enabled. */
	availableDates?: Set<string> | null;
	/** "Today" is computed in this timezone. */
	timezone: string;
	/** Days shown initially (default 35 ≈ 5 weeks). */
	days?: number;
	/** Upper bound when the visitor asks for later dates (default 120). */
	maxDays?: number;
	/** Accessible label for the strip. */
	label?: string;
}

const WEEKDAY = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' });
const MONTH_SHORT = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const MONTH = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' });
const LONG = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });

function asDate(d: string) {
	return new Date(`${d}T00:00:00Z`);
}

/**
 * Horizontal day ribbon: scroll-snapped day tiles from today, a month masthead
 * that follows the scroll, prev/next and "Later" to extend the horizon.
 * Closed days (not in `availableDates`) are greyed and disabled. Arrow keys
 * move between days. Reusable (booking composer, account reschedule).
 */
export function DayRibbon({
	selected,
	onSelect,
	availableDates = null,
	timezone,
	days: initialDays = 35,
	maxDays = 120,
	label = 'Choose a day',
}: DayRibbonProps) {
	const groupId = useId();
	const scrollRef = useRef<HTMLDivElement>(null);
	const [count, setCount] = useState(initialDays);
	const today = useMemo(() => todayIn(timezone), [timezone]);
	const dates = useMemo(() => Array.from({ length: count }, (_, i) => plusDays(today, i)), [today, count]);
	const [leftDate, setLeftDate] = useState<string>(selected ?? today);

	// A pre-selected day past the horizon (deep link) extends the ribbon to it.
	useEffect(() => {
		if (!selected || selected < today) return;
		const diff = Math.round((asDate(selected).getTime() - asDate(today).getTime()) / 86_400_000) + 7;
		if (diff > count) setCount(Math.min(maxDays, diff));
	}, [selected, today, count, maxDays]);

	// Keep the selected tile in view — scroll the strip only, never the page.
	useEffect(() => {
		const list = scrollRef.current;
		const el = selected ? list?.querySelector<HTMLElement>(`[data-date="${selected}"]`) : null;
		if (!list || !el) return;
		const left = el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2;
		list.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
	}, [selected]);

	// Month masthead follows the first visible tile.
	const onScroll = useCallback(() => {
		const list = scrollRef.current;
		if (!list) return;
		const tiles = list.querySelectorAll<HTMLElement>('[data-date]');
		for (const tile of tiles) {
			if (tile.offsetLeft + tile.offsetWidth > list.scrollLeft + 8) {
				const d = tile.dataset.date;
				if (d) setLeftDate((cur) => (cur === d ? cur : d));
				break;
			}
		}
	}, []);

	const page = (dir: 1 | -1) => {
		const list = scrollRef.current;
		if (list) list.scrollBy({ left: dir * list.clientWidth * 0.8, behavior: 'smooth' });
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
		const tiles = Array.from(scrollRef.current?.querySelectorAll<HTMLButtonElement>('button[data-date]:not(:disabled)') ?? []);
		const i = tiles.indexOf(document.activeElement as HTMLButtonElement);
		if (i < 0) return;
		e.preventDefault();
		tiles[e.key === 'ArrowRight' ? Math.min(tiles.length - 1, i + 1) : Math.max(0, i - 1)]?.focus();
	};

	const masthead = asDate(leftDate);
	const openCount = availableDates ? dates.filter((d) => availableDates.has(d)).length : null;

	return (
		<div>
			<div className="mb-4 flex items-end justify-between gap-4">
				<p className="flex items-baseline gap-3" aria-live="polite">
					<span className="font-display text-3xl italic leading-none text-charcoal">{MONTH.format(masthead)}</span>
					<span className="tabular text-xs text-warm-gray">{masthead.getUTCFullYear()}</span>
				</p>
				<div className="flex items-center gap-1">
					<RibbonArrow dir={-1} onClick={() => page(-1)} />
					<RibbonArrow dir={1} onClick={() => page(1)} />
				</div>
			</div>

			<LayoutGroup id={groupId}>
				<div
					ref={scrollRef}
					data-lenis-prevent
					role="group"
					aria-label={label}
					onScroll={onScroll}
					onKeyDown={onKeyDown}
					className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-1.5 overflow-x-auto scroll-px-1 px-1 py-1"
				>
					{dates.map((date, i) => {
						const d = asDate(date);
						const isSelected = date === selected;
						const closed = availableDates ? !availableDates.has(date) : false;
						const firstOfMonth = d.getUTCDate() === 1;
						return (
							<button
								key={date}
								type="button"
								data-date={date}
								disabled={closed}
								aria-pressed={isSelected}
								aria-label={`${LONG.format(d)}${closed ? ', fully booked' : ''}`}
								onClick={() => onSelect(date)}
								className={clsx(
									'relative flex w-[4.25rem] shrink-0 snap-start flex-col items-center border px-2 pt-3 pb-2.5 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
									firstOfMonth && i > 0 && 'ml-3',
									isSelected
										? 'border-charcoal text-cream'
										: closed
											? 'cursor-not-allowed border-transparent text-charcoal/25'
											: 'border-line text-charcoal hover:border-charcoal/50',
								)}
							>
								{isSelected ? (
									<motion.span layoutId="day-ribbon-fill" transition={SPRING_SOFT} className="absolute inset-0 -z-0 bg-charcoal" aria-hidden />
								) : null}
								<span className={clsx('eyebrow relative text-[0.58rem]', isSelected ? 'text-cream/70' : closed ? '' : 'text-warm-gray')}>
									{i === 0 ? 'Today' : WEEKDAY.format(d)}
								</span>
								<span className={clsx('relative mt-1 font-display text-[1.75rem] leading-none', closed && 'line-through decoration-1')}>
									{d.getUTCDate()}
								</span>
								<span className={clsx('eyebrow relative mt-1.5 text-[0.55rem]', isSelected ? 'text-brass-light' : 'text-brass')}>
									{firstOfMonth || i === 0 ? MONTH_SHORT.format(d) : <span aria-hidden>&middot;</span>}
								</span>
							</button>
						);
					})}
					{count < maxDays ? (
						<button
							type="button"
							onClick={() => setCount((n) => Math.min(maxDays, n + 21))}
							className="eyebrow flex w-[5.5rem] shrink-0 snap-start flex-col items-center justify-center gap-1 border border-dashed border-line-strong text-[0.6rem] text-charcoal transition-colors hover:border-charcoal focus-visible:outline-2 focus-visible:outline-accent"
						>
							Later
							<span aria-hidden>&rarr;</span>
						</button>
					) : null}
				</div>
			</LayoutGroup>

			{openCount === 0 ? (
				<p className="mt-3 text-sm text-warm-gray">No open days in this stretch — try later dates.</p>
			) : null}
		</div>
	);
}

function RibbonArrow({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={dir === 1 ? 'Later days' : 'Earlier days'}
			className="flex h-9 w-9 items-center justify-center border border-line text-charcoal transition-colors hover:border-charcoal focus-visible:outline-2 focus-visible:outline-accent"
		>
			<svg className={clsx('h-3.5 w-3.5', dir === -1 && 'rotate-180')} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
				<path d="M6 3l5 5-5 5" strokeLinecap="square" />
			</svg>
		</button>
	);
}

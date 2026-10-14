'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { buttonClasses } from '@/components/ui/button';
import { googleCalendarHref, icsHref, ICS_FILENAME, type CalendarEvent } from '@/lib/calendar';

/**
 * "Add to calendar" with a small menu: an .ics download (Apple, Outlook) and
 * a Google Calendar link. Closes on Esc and outside click.
 */
export function AddToCalendar({
	event,
	variant = 'outline',
	className,
	menuAlign = 'left',
}: {
	event: CalendarEvent;
	variant?: 'outline' | 'inverse' | 'ghost';
	className?: string;
	menuAlign?: 'left' | 'right';
}) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const menuId = useId();
	const ics = useMemo(() => icsHref([event]), [event]);
	const google = useMemo(() => googleCalendarHref(event), [event]);

	useEffect(() => {
		if (!open) return;
		const onDown = (e: PointerEvent) => {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOpen(false);
		};
		document.addEventListener('pointerdown', onDown);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('pointerdown', onDown);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);

	return (
		<div ref={rootRef} className={clsx('relative', className)}>
			<button
				type="button"
				aria-expanded={open}
				aria-controls={menuId}
				onClick={() => setOpen((o) => !o)}
				className={buttonClasses({ variant, size: 'sm', fullWidth: true })}
			>
				Add to calendar
			</button>
			{open ? (
				<div
					id={menuId}
					className={clsx(
						'absolute top-full z-20 mt-2 w-56 border border-line-strong bg-paper py-2 shadow-[0_20px_50px_-25px_rgba(28,25,23,0.4)]',
						menuAlign === 'right' ? 'right-0' : 'left-0',
					)}
				>
					<a
						href={ics}
						download={ICS_FILENAME}
						onClick={() => setOpen(false)}
						className="block px-4 py-2.5 text-sm text-charcoal transition-colors hover:bg-cream focus-visible:bg-cream focus-visible:outline-none"
					>
						Apple / Outlook <span className="text-warm-gray">(.ics)</span>
					</a>
					<a
						href={google}
						target="_blank"
						rel="noopener noreferrer"
						onClick={() => setOpen(false)}
						className="block px-4 py-2.5 text-sm text-charcoal transition-colors hover:bg-cream focus-visible:bg-cream focus-visible:outline-none"
					>
						Google Calendar <span aria-hidden>↗</span>
					</a>
				</div>
			) : null}
		</div>
	);
}

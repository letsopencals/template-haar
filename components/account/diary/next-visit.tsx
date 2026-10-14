'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { buttonClasses } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { Reveal } from '@/components/motion/reveal';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { AddToCalendar } from '@/components/account/add-to-calendar';
import { StylistPortrait } from '@/components/account/stylist-portrait';
import { Countdown } from '@/components/account/diary/countdown';
import { getChangePolicy } from '@/components/account/appointment-detail/policy';
import {
	placeLabel,
	serviceTitle,
	stylistName,
	toCalendarEvent,
	variantLabel,
	type DiaryAppointment,
} from '@/components/account/appointment-utils';

/** Hero for the nearest upcoming appointment: arch portrait, when, countdown, actions. */
export function NextVisit({ appointment, now }: { appointment: DiaryAppointment; now: number }) {
	const { formatCustom, formatTime } = useDateFormatter();
	const policy = getChangePolicy(appointment, now);
	const event = useMemo(() => toCalendarEvent(appointment), [appointment]);
	const stylist = stylistName(appointment);
	const variant = variantLabel(appointment);
	const place = placeLabel(appointment);
	const detail = `/account/appointments/${appointment.id}`;

	return (
		<Reveal as="section" className="relative">
			<div className="grid items-center gap-10 border border-line-strong bg-cream/60 p-6 sm:p-10 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-14 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:p-14">
				<div className="relative mx-auto w-full max-w-[15rem] md:max-w-none">
					<ArchOutline className="absolute -inset-2.5 h-[calc(100%+1.25rem)] w-[calc(100%+1.25rem)]" />
					<StylistPortrait appointment={appointment} className="aspect-[3/4] w-full" priority />
					<p className="eyebrow mt-4 text-center text-warm-gray">{stylist ? `Pl. 01 · ${stylist}` : 'Pl. 01 · The Salon'}</p>
				</div>

				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-3">
						<p className="eyebrow text-brass">Your next visit</p>
						<span aria-hidden className="h-px w-8 bg-brass/50" />
						<Countdown from={appointment.from} className="font-display text-lg italic text-accent" />
					</div>

					<h2 className="display-sm mt-5 text-charcoal">
						{serviceTitle(appointment)}
						{variant ? <span className="block font-display text-xl italic text-warm-gray">{variant}</span> : null}
					</h2>

					<dl className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
						<div>
							<dt className="eyebrow text-warm-gray">When</dt>
							<dd className="mt-2 text-charcoal">
								<span className="block font-display text-2xl">{formatCustom(appointment.from, 'dddd D MMMM')}</span>
								<span className="tabular mt-1 block text-sm text-warm-gray">
									{formatTime(appointment.from)} – {formatTime(appointment.to)}
								</span>
							</dd>
						</div>
						<div>
							<dt className="eyebrow text-warm-gray">With</dt>
							<dd className="mt-2 text-charcoal">
								<span className="block font-display text-2xl">{stylist ?? 'Any stylist'}</span>
								{place ? <span className="mt-1 block text-sm text-warm-gray">{place}</span> : null}
							</dd>
						</div>
					</dl>

					<div className="mt-8 flex flex-wrap items-center gap-3">
						<StatusBadge kind="appointment" status={appointment.status} />
						<span className="tabular text-xs text-warm-gray">Nº {appointment.name}</span>
					</div>

					<div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
						<Link href={detail} className={buttonClasses({ size: 'sm' })}>
							View booking
						</Link>
						{policy.canReschedule ? (
							<Link href={`${detail}?action=reschedule`} className={buttonClasses({ variant: 'outline', size: 'sm' })}>
								Reschedule
							</Link>
						) : null}
						<AddToCalendar event={event} />
						{policy.canCancel ? (
							<Link
								href={`${detail}?action=cancel`}
								className="eyebrow inline-flex items-center justify-center px-3 py-2.5 text-red-700 transition-colors hover:text-red-900 focus-visible:outline-2 focus-visible:outline-accent"
							>
								Cancel
							</Link>
						) : null}
					</div>
				</div>
			</div>
		</Reveal>
	);
}

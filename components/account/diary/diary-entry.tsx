'use client';

import Link from 'next/link';
import { memo } from 'react';
import { clsx } from 'clsx';
import { StatusBadge } from '@/components/ui/status-badge';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { serviceTitle, stylistName, variantLabel, type DiaryAppointment } from '@/components/account/appointment-utils';

/** One diary line: a date plate (Bodoni day, month eyebrow), the service, stylist, time and status. */
export const DiaryEntry = memo(function DiaryEntry({ appointment, past }: { appointment: DiaryAppointment; past?: boolean }) {
	const { formatCustom, formatTime } = useDateFormatter();
	const stylist = stylistName(appointment);
	const variant = variantLabel(appointment);
	const canceled = appointment.status === 'canceled';

	return (
		<li>
			<Link
				href={`/account/appointments/${appointment.id}`}
				className="group grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-5 border-b border-line py-6 transition-colors hover:bg-cream/50 focus-visible:bg-cream/50 focus-visible:outline-none sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:gap-8 sm:px-4"
			>
				<div className={clsx('flex flex-col items-center border-r border-line pr-5 text-center sm:pr-8', past && 'opacity-70')}>
					<span className="eyebrow text-brass">{formatCustom(appointment.from, 'MMM')}</span>
					<span className="mt-1 font-display text-5xl leading-none text-charcoal">{formatCustom(appointment.from, 'D')}</span>
					<span className="eyebrow mt-2 text-[0.6rem] text-warm-gray">{formatCustom(appointment.from, 'ddd')}</span>
				</div>

				<div className="min-w-0">
					<p className={clsx('font-display text-xl text-charcoal sm:text-2xl', canceled && 'text-warm-gray line-through decoration-1')}>
						{serviceTitle(appointment)}
						{variant ? <span className="italic text-warm-gray"> · {variant}</span> : null}
					</p>
					<p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-warm-gray">
						<span className="tabular">
							{formatTime(appointment.from)} – {formatTime(appointment.to)}
						</span>
						<span aria-hidden className="text-line-strong">/</span>
						<span>{stylist ? `with ${stylist}` : 'Any stylist'}</span>
						{past ? (
							<>
								<span aria-hidden className="text-line-strong">/</span>
								<span className="tabular">{formatCustom(appointment.from, 'YYYY')}</span>
							</>
						) : null}
					</p>
					<StatusBadge kind="appointment" status={appointment.status} className="mt-3 sm:hidden" />
				</div>

				<div className="hidden items-center gap-6 sm:flex">
					<StatusBadge kind="appointment" status={appointment.status} />
					<span aria-hidden className="text-warm-gray transition-transform duration-500 group-hover:translate-x-1 group-hover:text-accent">
						→
					</span>
				</div>
			</Link>
		</li>
	);
});

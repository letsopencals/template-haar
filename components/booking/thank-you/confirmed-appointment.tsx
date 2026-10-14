'use client';

import { memo } from 'react';
import { SafeImage } from '@/components/ui/safe-image';
import { googleCalendarHref } from '@/lib/calendar';
import type { ConfirmedAppointment as Row } from './confirmed-model';

const LINK = 'eyebrow link-underline text-[0.6rem] text-charcoal hover:text-accent';

/** One appointment on the confirmed card: portrait, service, when, where, and per-visit links. */
export const ConfirmedAppointment = memo(function ConfirmedAppointment({ row, index }: { row: Row; index: number }) {
	const portrait = row.staffImage ?? row.image;
	return (
		<li className="flex gap-5 py-6 first:pt-0 last:pb-0 sm:gap-7">
			<div className="arch-sm image-placeholder relative h-[104px] w-[78px] shrink-0 sm:h-[124px] sm:w-[93px]">
				<SafeImage
					src={portrait}
					alt={row.staffName && row.staffImage ? row.staffName : ''}
					fill
					sizes="93px"
					className="object-cover object-top"
				/>
			</div>

			<div className="min-w-0 flex-1">
				<p className="tabular text-[0.7rem] text-brass">Nº {String(index + 1).padStart(2, '0')}</p>
				<h3 className="mt-1 font-display text-[1.5rem] leading-[1.08] text-charcoal sm:text-[1.7rem]">{row.title}</h3>
				<p className="mt-1 text-sm text-warm-gray">
					{row.option ? <span className="italic-display text-[1.02rem] text-charcoal">{row.option}</span> : null}
					{row.option && row.staffName ? <span aria-hidden> · </span> : null}
					{row.staffName ? <>with {row.staffName}</> : null}
				</p>

				<dl className="mt-4 grid gap-x-6 gap-y-3 text-[0.85rem] sm:grid-cols-2">
					<div>
						<dt className="eyebrow text-[0.58rem] text-warm-gray">When</dt>
						<dd className="tabular mt-1 text-charcoal">
							{row.dateLabel}
							<br />
							{row.timeLabel}
							{row.zoneLabel ? <span className="text-warm-gray"> {row.zoneLabel}</span> : null}
						</dd>
					</div>
					{row.locationTitle || row.address ? (
						<div>
							<dt className="eyebrow text-[0.58rem] text-warm-gray">Where</dt>
							<dd className="mt-1 text-charcoal">
								{row.locationTitle ? <span className="block">{row.locationTitle}</span> : null}
								{row.address ? <span className="block text-warm-gray">{row.address}</span> : null}
							</dd>
						</div>
					) : null}
				</dl>

				{row.addOns.length > 0 ? (
					<p className="mt-3 text-[0.8rem] text-warm-gray">
						<span className="eyebrow mr-2 text-[0.58rem]">Finishing touches</span>
						{row.addOns.map((a) => (a.quantity > 1 ? `${a.title} × ${a.quantity}` : a.title)).join(', ')}
					</p>
				) : null}
				{row.attendees > 1 ? <p className="mt-2 text-[0.8rem] text-warm-gray">{row.attendees} guests</p> : null}

				<div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
					<a href={googleCalendarHref(row.event)} target="_blank" rel="noopener noreferrer" className={LINK}>
						Google Calendar<span className="sr-only"> (opens in a new tab)</span>
					</a>
					{row.directionsHref ? (
						<a href={row.directionsHref} target="_blank" rel="noopener noreferrer" className={LINK}>
							Directions<span className="sr-only"> to {row.locationTitle ?? 'the salon'} (opens in a new tab)</span>
						</a>
					) : null}
					{row.onlineLink ? (
						<a href={row.onlineLink} target="_blank" rel="noopener noreferrer" className={LINK}>
							Join link<span className="sr-only"> (opens in a new tab)</span>
						</a>
					) : null}
				</div>
			</div>
		</li>
	);
});

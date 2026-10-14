'use client';

import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { StatusBadge } from '@/components/ui/status-badge';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { RevealArch } from '@/components/motion/reveal-arch';
import { Reveal } from '@/components/motion/reveal';
import { SafeImage } from '@/components/ui/safe-image';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { Countdown } from '@/components/account/diary/countdown';
import { serviceTitle, stylistName, variantLabel } from '@/components/account/appointment-utils';

/** Masthead for one booking: the arch portrait, the service as a headline, date plate and status. */
export function DetailHero({ appointment, upcoming }: { appointment: AppointmentDetailResponse; upcoming: boolean }) {
	const { formatCustom, formatTime } = useDateFormatter();
	const stylist = stylistName(appointment);
	const variant = variantLabel(appointment);
	const src = appointment.staffMember?.image?.url || appointment.product?.image?.url || null;
	const canceled = appointment.status === 'canceled';

	return (
		<section className="grid items-end gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,14rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
			<Reveal className="min-w-0">
				<div className="flex flex-wrap items-center gap-3">
					<p className="eyebrow text-brass">Booking Nº {appointment.name}</p>
					<StatusBadge kind="appointment" status={appointment.status} />
				</div>
				<h2 className="display-md mt-6 text-charcoal [&_em]:text-accent">
					{canceled ? <span className="text-warm-gray">{serviceTitle(appointment)}</span> : serviceTitle(appointment)}
					{variant ? <em className="block text-[0.55em]">{variant}</em> : null}
				</h2>

				<div className="mt-10 flex items-stretch gap-6 border-t border-line pt-6">
					<div className="flex flex-col items-center border-r border-line pr-6 text-center">
						<span className="eyebrow text-brass">{formatCustom(appointment.from, 'MMM')}</span>
						<span className="mt-1 font-display text-6xl leading-none text-charcoal">{formatCustom(appointment.from, 'D')}</span>
						<span className="eyebrow mt-2 text-[0.6rem] text-warm-gray">{formatCustom(appointment.from, 'YYYY')}</span>
					</div>
					<div className="flex min-w-0 flex-col justify-center">
						<p className="font-display text-2xl text-charcoal">{formatCustom(appointment.from, 'dddd')}</p>
						<p className="tabular mt-1 text-sm text-warm-gray">
							{formatTime(appointment.from)} – {formatTime(appointment.to)}
						</p>
						{upcoming ? <Countdown from={appointment.from} className="mt-2 font-display text-lg italic text-accent" /> : null}
					</div>
				</div>
			</Reveal>

			<div className="relative mx-auto w-full max-w-[14rem] md:mx-0 md:max-w-none">
				<ArchOutline className="absolute -inset-2.5 h-[calc(100%+1.25rem)] w-[calc(100%+1.25rem)]" />
				<RevealArch trigger="mount" className="aspect-[3/4] w-full">
					<span aria-hidden className="absolute inset-0 flex items-center justify-center font-display text-5xl italic text-warm-gray-light">
						{stylist ? stylist.split(' ').map((p) => p[0]).join('') : 'H'}
					</span>
					<SafeImage src={src} alt={stylist ?? serviceTitle(appointment)} fill sizes="(min-width: 768px) 17rem, 60vw" className="object-cover" priority />
				</RevealArch>
				<p className="eyebrow mt-4 text-center text-warm-gray">{stylist ? `Pl. · ${stylist}` : 'Pl. · Any stylist'}</p>
			</div>
		</section>
	);
}

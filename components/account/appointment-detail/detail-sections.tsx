'use client';

import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { Reveal } from '@/components/motion/reveal';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { useSettings } from '@/contexts/settings-context';
import { computeAddOnLineTotal, formatDuration, formatPrice } from '@/lib/format';
import { placeLabel, stylistName } from '@/components/account/appointment-utils';

function Section({ numeral, title, children }: { numeral: string; title: string; children: React.ReactNode }) {
	return (
		<Reveal as="section">
			<h3 className="flex items-baseline gap-4 border-b border-charcoal pb-3">
				<span className="eyebrow text-brass">{numeral}</span>
				<span className="font-display text-2xl text-charcoal">{title}</span>
			</h3>
			<div className="pt-2">{children}</div>
		</Reveal>
	);
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex items-baseline border-b border-line py-4">
			<dt className="eyebrow shrink-0 text-warm-gray">{label}</dt>
			<span aria-hidden className="leader-line" />
			<dd className="min-w-0 text-right text-sm text-charcoal">{children}</dd>
		</div>
	);
}

/** Details, add-ons, the place and any answers given at checkout. */
export function DetailSections({ appointment }: { appointment: AppointmentDetailResponse }) {
	const { formatCustom } = useDateFormatter();
	const { currency: storeCurrency } = useSettings();
	const currency = appointment.order?.paymentCurrencyCode || storeCurrency;
	const spanSeconds = Math.max(0, (new Date(appointment.to).getTime() - new Date(appointment.from).getTime()) / 1000);
	const baseDuration = appointment.product?.duration || spanSeconds || 1;
	const units = Math.max(1, Math.round(spanSeconds / baseDuration));
	const stylist = stylistName(appointment);
	const location = appointment.location;
	const place = placeLabel(appointment);
	const addOns = appointment.addOns ?? [];
	const answers = (appointment.checkoutQuestionAnswers ?? []).filter((a) => a.answer);
	const guests = appointment.guests ?? [];
	const online = location?.type === 'online';

	return (
		<div className="space-y-14">
			<Section numeral="I" title="The appointment">
				<dl>
					<Row label="Service">{appointment.product?.title}</Row>
					<Row label="Stylist">{stylist ?? 'Any stylist'}</Row>
					<Row label="Length">
						<span className="tabular">{formatDuration(spanSeconds)}</span>
					</Row>
					{appointment.numberOfAttendees > 1 ? (
						<Row label="Guests">
							<span className="tabular">{appointment.numberOfAttendees}</span>
						</Row>
					) : null}
					<Row label="Booked">
						<span className="tabular">{formatCustom(appointment.createdAt, 'D MMM YYYY')}</span>
					</Row>
				</dl>
			</Section>

			{addOns.length > 0 ? (
				<Section numeral="II" title="Finishing touches">
					<ul>
						{addOns.map((a) => (
							<li key={a.id} className="flex items-baseline border-b border-line py-4 text-sm">
								<span className="text-charcoal">
									{a.addOn?.title ?? 'Add-on'}
									{a.quantity > 1 ? <span className="tabular text-warm-gray"> × {a.quantity}</span> : null}
								</span>
								<span aria-hidden className="leader-line" />
								<span className="tabular text-charcoal">
									{a.addOn ? formatPrice(computeAddOnLineTotal(a.addOn, a.quantity, units), currency) : ''}
								</span>
							</li>
						))}
					</ul>
				</Section>
			) : null}

			{location || place ? (
				<Section numeral={addOns.length > 0 ? 'III' : 'II'} title={online ? 'Online' : 'Where'}>
					<div className="py-4">
						{location?.title ? <p className="font-display text-xl text-charcoal">{location.title}</p> : null}
						{!online && place && place !== location?.title ? (
							<p className="mt-1.5 text-sm leading-relaxed text-warm-gray">{place}</p>
						) : null}
						{online && location?.link ? (
							<a
								href={location.link}
								target="_blank"
								rel="noopener noreferrer"
								className="eyebrow link-underline mt-3 inline-block text-accent"
							>
								Join link ↗
							</a>
						) : null}
						{!online && place ? (
							<a
								href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`}
								target="_blank"
								rel="noopener noreferrer"
								className="eyebrow link-underline mt-4 inline-block text-charcoal hover:text-accent"
							>
								Directions ↗
							</a>
						) : null}
					</div>
				</Section>
			) : null}

			{answers.length > 0 || guests.length > 0 ? (
				<Section numeral="·" title="Your notes">
					<dl>
						{answers.map((a) => (
							<div key={a.id} className="border-b border-line py-4">
								<dt className="eyebrow text-warm-gray">{a.question}</dt>
								<dd className="mt-2 whitespace-pre-line text-sm text-charcoal">{a.answer}</dd>
							</div>
						))}
						{guests.length > 0 ? (
							<div className="border-b border-line py-4">
								<dt className="eyebrow text-warm-gray">Guests invited</dt>
								<dd className="mt-2 text-sm text-charcoal">{guests.map((g) => g.email).join(', ')}</dd>
							</div>
						) : null}
					</dl>
				</Section>
			) : null}
		</div>
	);
}

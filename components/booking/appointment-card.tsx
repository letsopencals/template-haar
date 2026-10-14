'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { BookingFlow } from '@/hooks/use-booking-flow';
import { useCart } from '@/contexts/cart-context';
import { formatDuration, formatPrice, getProductImage } from '@/lib/format';
import { getStaffImageUrl, getStaffName } from '@/lib/staff-utils';
import { Button, buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Seal } from '@/components/motifs/seal';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_EXPO } from '@/components/motion/easing';
import { salonName } from '@/components/services/location-filter';
import { formatLongDate, formatSlotRange } from './slot-time';

const FLIP = { duration: 1, ease: EASE_EXPO } as const;
const FADE = { duration: 0.3 } as const;

interface AppointmentCardProps {
	flow: BookingFlow;
	currency: string;
	timeFormat: '12H' | '24H';
	/** Called after a successful reserve (e.g. the mobile sheet opens to show the back). */
	onReserved?: () => void;
	className?: string;
}

function formatCountdown(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * The live appointment card. The front ink-writes each choice as it's made and
 * carries the Reserve button; once held in the cart it flips (rotateY, or a
 * crossfade under reduced motion) to the back: the hold countdown and the seal.
 */
export function AppointmentCard({ flow, currency, timeFormat, onReserved, className }: AppointmentCardProps) {
	const reduce = useReducedMotion();
	const flipped = flow.bookingSuccess;
	const { handleBooking } = flow;

	const reserve = useCallback(async () => {
		const ok = await handleBooking();
		if (ok) onReserved?.();
	}, [handleBooking, onReserved]);

	return (
		<div className={clsx('[perspective:1800px]', className)}>
			<motion.div
				className="grid [transform-style:preserve-3d]"
				initial={false}
				animate={reduce ? undefined : { rotateY: flipped ? 180 : 0 }}
				transition={FLIP}
			>
				<motion.div
					className="[grid-area:1/1] [backface-visibility:hidden]"
					initial={false}
					animate={reduce ? { opacity: flipped ? 0 : 1 } : undefined}
					transition={FADE}
					aria-hidden={flipped || undefined}
					inert={flipped || undefined}
				>
					<CardFront flow={flow} currency={currency} timeFormat={timeFormat} onReserve={reserve} />
				</motion.div>
				<motion.div
					className={clsx('[grid-area:1/1] [backface-visibility:hidden]', !reduce && '[transform:rotateY(180deg)]', !flipped && 'pointer-events-none')}
					initial={false}
					animate={reduce ? { opacity: flipped ? 1 : 0 } : undefined}
					transition={FADE}
					aria-hidden={!flipped || undefined}
					inert={!flipped || undefined}
				>
					<CardBack flow={flow} active={flipped} />
				</motion.div>
			</motion.div>
		</div>
	);
}

/** Re-keying the value replays the ink-in each time it changes. */
function Ink({ value, className }: { value: string; className?: string }) {
	return (
		<span key={value} className={clsx('animate-ink inline-block', className)}>
			{value}
		</span>
	);
}

function CardLine({ label, value, placeholder = '—' }: { label: string; value: string | null; placeholder?: string }) {
	return (
		<div className="flex items-baseline gap-3 border-b border-line py-2.5 last:border-b-0">
			<dt className="eyebrow w-[4.75rem] shrink-0 text-[0.6rem] text-warm-gray">{label}</dt>
			<dd className={clsx('min-w-0 flex-1 text-right font-display text-[1.05rem] leading-snug', value ? 'text-charcoal' : 'text-warm-gray-light')}>
				{value ? <Ink value={value} /> : placeholder}
			</dd>
		</div>
	);
}

function CardFront({
	flow,
	currency,
	timeFormat,
	onReserve,
}: {
	flow: BookingFlow;
	currency: string;
	timeFormat: '12H' | '24H';
	onReserve: () => void;
}) {
	const { product, activeVariant, hasVariants, finalStaff, selectedStaffId, stylistChosen, selectedSlot, selectedDate, selectedLocation, timezone } = flow;
	const serviceTitle = product?.title ?? activeVariant?.title ?? 'Your service';
	const portrait = (finalStaff && getStaffImageUrl(finalStaff)) || getProductImage(activeVariant) || getProductImage(product);
	const formatMoney = useCallback((cents: number) => formatPrice(cents / 100, currency), [currency]);

	const stylist = finalStaff
		? getStaffName(finalStaff)
		: stylistChosen && !selectedStaffId && flow.allStaff.length > 0
			? selectedSlot
				? 'Choose who'
				: 'Any — first available'
			: null;

	const extras = flow.availableAddOns
		.filter((a) => (flow.selectedAddOns.get(a.id) ?? 0) > 0)
		.map((a) => {
			const qty = flow.selectedAddOns.get(a.id) ?? 0;
			return !a.durationMultiplied && qty > 1 ? `${a.title} × ${qty}` : a.title;
		});

	return (
		<article className="relative overflow-hidden bg-cream shadow-float" aria-label="Your appointment card">
			<div className="grain pointer-events-none absolute inset-0 opacity-60" aria-hidden />
			<div className="relative p-6 sm:p-7">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="eyebrow text-[0.6rem] text-brass">HAAR · Appointment card</p>
						<p className="mt-3 font-display text-2xl leading-tight text-charcoal">
							<Ink value={serviceTitle} />
						</p>
						{hasVariants && activeVariant ? (
							<p className="mt-1 text-sm text-warm-gray italic">
								<Ink value={`${activeVariant.variantTitle || activeVariant.title} · ${formatDuration(activeVariant.duration)}`} />
							</p>
						) : activeVariant ? (
							<p className="mt-1 text-sm text-warm-gray">{formatDuration(activeVariant.duration)}</p>
						) : null}
					</div>
					<div className="arch image-placeholder relative h-24 w-[4.5rem] shrink-0 overflow-hidden">
						{portrait ? (
							<SafeImage key={portrait} src={portrait} alt="" fill sizes="72px" className="animate-ink object-cover object-top" />
						) : null}
					</div>
				</div>

				<dl className="mt-6">
					<CardLine label="Salon" value={selectedLocation ? salonName(selectedLocation) : null} />
					<CardLine label="Stylist" value={stylist} />
					<CardLine label="Day" value={selectedDate ? formatLongDate(selectedDate) : null} />
					<CardLine label="Time" value={selectedSlot ? formatSlotRange(selectedSlot, timezone, timeFormat) : null} />
					{extras.length ? <CardLine label="Extras" value={extras.join(', ')} /> : null}
					{flow.maxAttendees > 1 ? <CardLine label="Guests" value={String(flow.attendees)} /> : null}
				</dl>

				<div className="perforation -mx-6 mt-5 sm:-mx-7" aria-hidden />

				<div className="mt-5 flex items-baseline justify-between">
					<span className="eyebrow text-warm-gray">Total</span>
					<AnimatedNumber value={Math.round(flow.total * 100)} format={formatMoney} className="tabular font-display text-3xl text-charcoal" />
				</div>

				{flow.error ? (
					<p role="alert" className="mt-4 border-l-2 border-accent bg-paper px-3 py-2 text-sm text-accent-dark">
						{flow.error}
					</p>
				) : null}

				<Button variant="primary" size="lg" fullWidth className="mt-5" onClick={onReserve} disabled={!flow.canReserve} aria-describedby="card-missing">
					{flow.booking ? 'Holding your chair…' : 'Reserve'}
				</Button>
				<p id="card-missing" className="mt-3 min-h-5 text-center text-xs text-warm-gray" aria-live="polite">
					{flow.missing.length ? `Still to choose: ${flow.missing.join(', ')}` : flow.booking ? '' : 'Held for you while you check out.'}
				</p>
			</div>
		</article>
	);
}

function CardBack({ flow, active }: { flow: BookingFlow; active: boolean }) {
	const { timeRemaining } = useCart();
	const lapsed = timeRemaining === 0;
	const { finalStaff, selectedSlot, product } = flow;

	return (
		<article className="relative flex h-full flex-col overflow-hidden bg-charcoal text-cream shadow-float" aria-label="Appointment held">
			<div className="grain pointer-events-none absolute inset-0 opacity-30" aria-hidden />
			<div className="relative flex flex-1 flex-col items-center p-7 text-center">
				<p className="eyebrow text-[0.6rem] text-brass-light">HAAR · Appointment card</p>
				<div className="mt-8">
					{active ? <Seal key="seal" ring="Held for you · HAAR · " center="H." size={128} motion="stamp" className="text-brass-light" /> : null}
				</div>
				<p className="mt-8 font-display text-[2.4rem] leading-none">
					{lapsed ? (
						<>
							Hold <em className="italic-display">lapsed</em>
						</>
					) : (
						<>
							Held <em className="italic-display">for you.</em>
						</>
					)}
				</p>
				<p className="mt-3 max-w-[26ch] text-sm text-cream/70">
					{product?.title}
					{finalStaff ? ` with ${getStaffName(finalStaff)}` : ''}
					{selectedSlot ? `, ${formatLongDate(selectedSlot.fromDate)}` : ''}
				</p>

				{timeRemaining != null && !lapsed ? (
					<p className="mt-6" aria-live="off">
						<span className="eyebrow block text-[0.6rem] text-cream/60">Chair held for</span>
						<span className="tabular mt-1 block font-display text-4xl">{formatCountdown(timeRemaining)}</span>
					</p>
				) : null}

				<div className="mt-auto w-full space-y-3 pt-8">
					{lapsed ? (
						<Button variant="accent" size="lg" fullWidth onClick={flow.resetBooking}>
							Reserve again
						</Button>
					) : (
						<Link href="/checkout" className={buttonClasses({ variant: 'accent', size: 'lg', fullWidth: true })}>
							Continue to checkout
							<span aria-hidden>&rarr;</span>
						</Link>
					)}
					<Link href="/services" className={buttonClasses({ variant: 'inverse', size: 'md', fullWidth: true })}>
						Add another service
					</Link>
				</div>
			</div>
		</article>
	);
}

'use client';

import { useMemo } from 'react';
import { motion, type Transition } from 'framer-motion';
import type { OrderDetailResponse } from '@opencals/storefront-sdk';
import { Seal } from '@/components/motifs/seal';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_EXPO } from '@/components/motion/easing';
import { ICS_FILENAME, icsHref } from '@/lib/calendar';
import { formatPrice } from '@/lib/format';
import { siteConfig } from '@/lib/site-config';
import { ConfirmedAppointment } from './confirmed-appointment';
import { orderDiscountTotal, type ConfirmedAppointment as Row } from './confirmed-model';

const CARD_INITIAL = { opacity: 0, y: 60, rotate: -1.5 };
const CARD_ANIMATE = { opacity: 1, y: 0, rotate: 0 };
const CARD_TRANSITION: Transition = { duration: DURATION.slow, ease: EASE_EXPO };

interface ConfirmedTicketProps {
	order: OrderDetailResponse;
	rows: Row[];
}

/**
 * The appointment card returns — stamped Confirmed with the brass seal, a
 * perforated tear line, the order number, each visit, and the totals.
 */
export function ConfirmedTicket({ order, rows }: ConfirmedTicketProps) {
	const reduce = useReducedMotion();
	const currency = order.paymentCurrencyCode ?? 'USD';
	const discount = orderDiscountTotal(order);
	const email = order.customer?.email ?? order.customerEmail;
	const orderNo = (order.name ?? '').replace(/^#/, '');
	const ics = useMemo(() => (rows.length ? icsHref(rows.map((r) => r.event)) : null), [rows]);

	return (
		<motion.article
			aria-labelledby="confirmed-title"
			initial={reduce ? false : CARD_INITIAL}
			animate={CARD_ANIMATE}
			transition={CARD_TRANSITION}
			className="grain relative border border-line bg-cream shadow-float"
		>
			{/* Stamp — sits over the top-right corner of the card. */}
			<div className="pointer-events-none absolute -top-10 -right-3 z-[3] sm:-top-12 sm:-right-8">
				<Seal ring="Confirmed · See you soon · " size={124} motion="stamp" className="drop-shadow-sm" />
			</div>

			<header className="relative z-[2] px-6 pt-8 pb-7 sm:px-10 sm:pt-10">
				<p className="font-display text-xl tracking-[0.02em] text-charcoal">
					{siteConfig.logo.text}
					<span className="text-accent">{siteConfig.logo.accent}</span>
				</p>
				<p className="eyebrow mt-6 text-warm-gray">Appointment card</p>
				<h2 id="confirmed-title" className="display-sm mt-2 pr-24 text-charcoal">
					<em>Confirmed</em>
				</h2>
				<dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
					{orderNo ? (
						<div className="flex items-baseline gap-2">
							<dt className="eyebrow text-[0.6rem] text-warm-gray">Order</dt>
							<dd className="tabular text-charcoal">Nº {orderNo}</dd>
						</div>
					) : null}
					{email ? (
						<div className="flex min-w-0 items-baseline gap-2">
							<dt className="eyebrow text-[0.6rem] text-warm-gray">Sent to</dt>
							<dd className="min-w-0 truncate text-charcoal">{email}</dd>
						</div>
					) : null}
				</dl>
			</header>

			<div className="perforation relative z-[2] mx-6 sm:mx-10" aria-hidden />

			{rows.length > 0 ? (
				<ol className="relative z-[2] divide-y divide-line px-6 py-8 sm:px-10">
					{rows.map((row, i) => (
						<ConfirmedAppointment key={row.id} row={row} index={i} />
					))}
				</ol>
			) : (
				<p className="relative z-[2] px-6 py-8 text-sm text-warm-gray sm:px-10">Your booking details are in your confirmation email.</p>
			)}

			<footer className="relative z-[2] border-t border-line bg-paper/80 px-6 py-6 sm:px-10">
				<dl className="space-y-2 text-sm">
					<div className="flex justify-between gap-4">
						<dt className="text-warm-gray">Subtotal</dt>
						<dd className="tabular text-charcoal">{formatPrice(order.subtotal ?? 0, currency)}</dd>
					</div>
					{discount > 0 ? (
						<div className="flex justify-between gap-4">
							<dt className="text-accent-dark">Discounts</dt>
							<dd className="tabular text-accent-dark">−{formatPrice(discount, currency)}</dd>
						</div>
					) : null}
					{(order.totalTax ?? 0) > 0 ? (
						<div className="flex justify-between gap-4">
							<dt className="text-warm-gray">{order.taxesIncluded ? 'Tax (included)' : 'Tax'}</dt>
							<dd className="tabular text-charcoal">{formatPrice(order.totalTax ?? 0, currency)}</dd>
						</div>
					) : null}
					<div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
						<dt className="eyebrow text-charcoal">
							Total{' '}
							<span className={order.isFullyPaid ? 'text-emerald-800' : 'text-amber-800'}>
								· {order.isFullyPaid ? 'Paid' : 'Payment pending'}
							</span>
						</dt>
						<dd className="tabular text-[1.4rem] leading-none text-charcoal">{formatPrice(order.total ?? 0, currency)}</dd>
					</div>
				</dl>

				{ics ? (
					<a
						href={ics}
						download={ICS_FILENAME}
						className="eyebrow mt-6 inline-flex items-center gap-3 border border-charcoal/20 px-5 py-3 text-[0.62rem] text-charcoal transition-colors duration-300 hover:border-charcoal hover:bg-charcoal hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
					>
						<svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden>
							<rect x="2" y="3" width="12" height="11" />
							<path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
						</svg>
						{rows.length > 1 ? `Add all ${rows.length} to calendar` : 'Add to calendar'} (.ics)
					</a>
				) : null}
			</footer>
		</motion.article>
	);
}

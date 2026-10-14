'use client';

import { useId, useState } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { useCart } from '@/contexts/cart-context';
import { AppointmentCard } from '@/components/cart/appointment-card';
import { CartTotals } from '@/components/cart/cart-totals';
import { HoldBar } from '@/components/cart/hold-bar';
import { PromoCode } from '@/components/cart/promo-code';
import { useCartLines } from '@/components/cart/cart-line';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';
import { formatPrice } from '@/lib/format';

const OPEN_INITIAL = { height: 0, opacity: 0 };
const OPEN_ANIMATE = { height: 'auto', opacity: 1 };
const OPEN_TRANSITION: Transition = { duration: 0.5, ease: EASE_OUT };
const NO_TRANSITION: Transition = { duration: 0 };

/** Mobile/tablet: a "Total ▾" disclosure above the steps, plus the hold bar. */
export function MobileSummary() {
	const { cart, timeRemaining, extendCart } = useCart();
	const lines = useCartLines(cart);
	const [open, setOpen] = useState(false);
	const reduce = useReducedMotion();
	const panelId = useId();

	if (!cart) return null;
	const total = cart.total ?? cart.subtotal ?? 0;

	return (
		<div className="border-y border-line lg:hidden">
			<button
				type="button"
				aria-expanded={open}
				aria-controls={panelId}
				onClick={() => setOpen((v) => !v)}
				className="flex w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
			>
				<span className="eyebrow text-charcoal">
					{open ? 'Hide' : 'Show'} your card{' '}
					<span className="tabular text-brass">· {String(lines.length).padStart(2, '0')}</span>
				</span>
				<span className="flex items-center gap-3">
					<span className="tabular text-lg text-charcoal">{formatPrice(total, cart.paymentCurrencyCode)}</span>
					<svg
						className={`h-3 w-3 transition-transform duration-500 ${open ? 'rotate-180' : ''}`}
						viewBox="0 0 12 12"
						fill="none"
						stroke="currentColor"
						strokeWidth={1.4}
						aria-hidden
					>
						<path d="M2 4.5l4 4 4-4" />
					</svg>
				</span>
			</button>

			<AnimatePresence initial={false}>
				{open ? (
					<motion.div
						id={panelId}
						key="panel"
						initial={reduce ? false : OPEN_INITIAL}
						animate={OPEN_ANIMATE}
						exit={reduce ? undefined : OPEN_INITIAL}
						transition={reduce ? NO_TRANSITION : OPEN_TRANSITION}
						className="overflow-hidden"
					>
						<div className="space-y-4 pb-6">
							<ul className="space-y-4">
								{lines.map((line, i) => (
									<li key={line.id}>
										<AppointmentCard line={line} index={i} currency={cart.paymentCurrencyCode} />
									</li>
								))}
							</ul>
							<PromoCode className="pt-2" />
							<CartTotals cart={cart} showTax />
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>

			{timeRemaining !== null ? (
				<div className="border-t border-line py-3.5">
					<HoldBar timeRemaining={timeRemaining} expiresAt={cart.expiresAt} onExtend={extendCart} />
				</div>
			) : null}
		</div>
	);
}

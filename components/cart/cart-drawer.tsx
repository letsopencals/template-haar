'use client';

import { useId, useRef } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { useCart } from '@/contexts/cart-context';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT, SPRING_SOFT } from '@/components/motion/easing';
import { buttonClasses } from '@/components/ui/button';
import { AppointmentCard } from './appointment-card';
import { CartTotals } from './cart-totals';
import { EmptyCard } from './empty-card';
import { HoldBar } from './hold-bar';
import { PromoCode } from './promo-code';
import { useCartLines } from './cart-line';
import { useDialogA11y } from './use-dialog-a11y';

interface CartDrawerProps {
	open: boolean;
	onClose: () => void;
}

const OVERLAY_INITIAL = { opacity: 0 };
const OVERLAY_ANIMATE = { opacity: 1 };
const OVERLAY_TRANSITION: Transition = { duration: DURATION.fast };
const PANEL_INITIAL = { x: '100%' };
const PANEL_ANIMATE = { x: 0 };
const PANEL_TRANSITION: Transition = SPRING_SOFT;
const FADE_TRANSITION: Transition = { duration: 0.2 };
const CARD_INITIAL = { opacity: 0, y: 24 };
const CARD_ANIMATE = { opacity: 1, y: 0 };
const CARD_EXIT = { opacity: 0, x: 40, transition: { duration: 0.3, ease: EASE_OUT } };

/**
 * "Your appointment cards" — the right-hand drawer. A stack of the mini
 * appointment cards the composer printed, the hold countdown with Extend, a
 * promo code and the running total.
 */
export function CartDrawer({ open, onClose }: CartDrawerProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const titleId = useId();
	const reduce = useReducedMotion();
	const { cart, removeItem, updateAddOnQuantity, removeAddOnItem, timeRemaining, extendCart } = useCart();
	const lines = useCartLines(cart);

	useDialogA11y(panelRef, open, onClose);

	const count = lines.length;
	const isExpired = timeRemaining !== null && timeRemaining <= 0;

	return (
		<AnimatePresence>
			{open ? (
				<div className="fixed inset-0 z-[80]" key="cart-drawer">
					<motion.div
						aria-hidden
						className="absolute inset-0 bg-charcoal/40 backdrop-blur-[3px]"
						initial={OVERLAY_INITIAL}
						animate={OVERLAY_ANIMATE}
						exit={OVERLAY_INITIAL}
						transition={OVERLAY_TRANSITION}
						onClick={onClose}
					/>

					<motion.div
						ref={panelRef}
						role="dialog"
						aria-modal="true"
						aria-labelledby={titleId}
						tabIndex={-1}
						initial={reduce ? OVERLAY_INITIAL : PANEL_INITIAL}
						animate={reduce ? OVERLAY_ANIMATE : PANEL_ANIMATE}
						exit={reduce ? OVERLAY_INITIAL : PANEL_INITIAL}
						transition={reduce ? FADE_TRANSITION : PANEL_TRANSITION}
						className="grain absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-cream shadow-float outline-none"
					>
						{/* Masthead */}
						<header className="relative z-[2] flex items-start justify-between gap-4 border-b border-line px-5 pt-6 pb-5 sm:px-7">
							<div>
								<p className="eyebrow text-warm-gray">
									Your card <span className="tabular text-brass">· {String(count).padStart(2, '0')}</span>
								</p>
								<h2 id={titleId} className="display-sm mt-2 text-charcoal">
									Your <em>appointments</em>
								</h2>
							</div>
							<button
								type="button"
								onClick={onClose}
								aria-label="Close your appointment cards"
								className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center text-charcoal transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
							>
								<svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.3} aria-hidden>
									<path d="M2 2l12 12M14 2L2 14" />
								</svg>
							</button>
						</header>

						{count > 0 && timeRemaining !== null ? (
							<div className="relative z-[2] border-b border-line bg-paper/70 px-5 py-3.5 sm:px-7">
								<HoldBar timeRemaining={timeRemaining} expiresAt={cart?.expiresAt} onExtend={extendCart} onNavigate={onClose} />
							</div>
						) : null}

						{/* Cards */}
						<div data-lenis-prevent className="relative z-[2] flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
							{count === 0 ? (
								<EmptyCard onNavigate={onClose} />
							) : (
								<ul className="space-y-4">
									<AnimatePresence initial={!reduce}>
										{lines.map((line, i) => (
											<motion.li
												key={line.id}
												layout={!reduce}
												initial={reduce ? false : CARD_INITIAL}
												animate={CARD_ANIMATE}
												exit={reduce ? undefined : CARD_EXIT}
												transition={{ duration: DURATION.base, ease: EASE_OUT, delay: 0.12 + i * 0.07 }}
											>
												<AppointmentCard
													line={line}
													index={i}
													currency={cart?.paymentCurrencyCode}
													editable
													onRemove={removeItem}
													onAddOnQuantity={updateAddOnQuantity}
													onAddOnRemove={removeAddOnItem}
													className="shadow-card"
												/>
											</motion.li>
										))}
									</AnimatePresence>
								</ul>
							)}
						</div>

						{count > 0 && cart ? (
							<footer className="relative z-[2] border-t border-line bg-paper px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-7">
								<PromoCode />
								<CartTotals cart={cart} className="mt-5" />
								{isExpired ? (
									<Link href="/services" onClick={onClose} className={buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true, className: 'mt-5' })}>
										Choose a new time
									</Link>
								) : (
									<Link href="/checkout" onClick={onClose} className={buttonClasses({ variant: 'primary', size: 'lg', fullWidth: true, className: 'mt-5' })}>
										Continue to checkout
										<span aria-hidden className="transition-transform duration-500 group-hover/btn:translate-x-1">
											→
										</span>
									</Link>
								)}
								<Link
									href="/services"
									onClick={onClose}
									className="link-underline mx-auto mt-4 block w-fit text-xs text-warm-gray hover:text-charcoal"
								>
									Add another service from The Menu
								</Link>
							</footer>
						) : null}
					</motion.div>
				</div>
			) : null}
		</AnimatePresence>
	);
}

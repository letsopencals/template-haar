'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { formatPrice, formatDuration } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import type { CartItemWithAppointment } from '@/contexts/checkout-context';

interface CartDrawerProps {
	open: boolean;
	onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
	const { cart, removeItem, timeRemaining } = useCart();
	const { formatCustom, formatSlot } = useDateFormatter();

	const items = (cart?.items ?? []) as CartItemWithAppointment[];
	const isExpired = timeRemaining !== null && timeRemaining <= 0;
	const minutes = timeRemaining !== null ? Math.floor(timeRemaining / 60) : null;
	const seconds = timeRemaining !== null ? timeRemaining % 60 : null;

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 z-50 bg-charcoal/30 backdrop-blur-sm"
						onClick={onClose}
					/>

					{/* Drawer */}
					<motion.div
						initial={{ x: '100%' }}
						animate={{ x: 0 }}
						exit={{ x: '100%' }}
						transition={{ type: 'spring', damping: 30, stiffness: 300 }}
						className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
					>
						{/* Header */}
						<div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-5">
							<h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
								Your Cart ({items.length})
							</h2>
							<button
								onClick={onClose}
								className="flex h-8 w-8 items-center justify-center text-warm-gray transition-colors hover:text-charcoal"
								aria-label="Close cart"
							>
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Timer */}
						{timeRemaining !== null && !isExpired && (
							<div
								className={`px-6 py-2 text-center text-xs ${
									timeRemaining <= 60
										? 'bg-red-50 text-red-700'
										: timeRemaining <= 120
											? 'bg-amber-50 text-amber-700'
											: 'bg-cream/50 text-warm-gray'
								}`}
							>
								Expires in{' '}
								<span className="font-semibold">
									{minutes}:{String(seconds).padStart(2, '0')}
								</span>
							</div>
						)}

						{isExpired && (
							<div className="bg-amber-50 px-6 py-2 text-center text-xs text-amber-700">
								Cart expired. Please book again.
							</div>
						)}

						{/* Items */}
						<div className="flex-1 overflow-y-auto px-6 py-4">
							{items.length === 0 ? (
								<div className="flex h-full flex-col items-center justify-center text-center">
									<svg className="h-12 w-12 text-charcoal/10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
									</svg>
									<p className="mt-4 text-sm text-warm-gray">Your cart is empty</p>
									<Link
										href="/services"
										onClick={onClose}
										className="mt-4 text-xs font-semibold uppercase tracking-[0.15em] text-accent hover:underline"
									>
										Browse Services
									</Link>
								</div>
							) : (
								<div className="divide-y divide-charcoal/5">
									{items.map((item) => (
										<div key={item.id} className="py-4 first:pt-0 last:pb-0">
											<div className="flex items-start justify-between gap-3">
												<div className="flex-1">
													<p className="text-sm font-medium text-charcoal">
														{item.appointment?.product?.title ?? 'Service'}
													</p>
													{item.appointment?.fromDate && (
														<p className="mt-1 text-xs text-warm-gray">
															{formatCustom(item.appointment.fromDate + 'T00:00:00', 'ddd, MMM D')}
															{item.appointment.fromTime && (
																<>
																	{' at '}
																	{formatSlot(item.appointment.fromDate, item.appointment.fromTime, 'time')}
																</>
															)}
														</p>
													)}
													{item.appointment?.product?.duration && (
														<p className="mt-0.5 text-xs text-warm-gray">
															{formatDuration(item.appointment.product.duration)}
														</p>
													)}
												</div>
												<div className="flex items-start gap-2">
													<span className="text-sm font-semibold text-charcoal">
														{formatPrice(item.originalUnitPrice ?? 0, cart?.paymentCurrencyCode)}
													</span>
													<button
														onClick={() => removeItem(item.id)}
														className="flex h-6 w-6 items-center justify-center text-warm-gray transition-colors hover:text-red-500"
														aria-label="Remove item"
													>
														<svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
															<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
														</svg>
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Footer */}
						{items.length > 0 && (
							<div className="border-t border-charcoal/10 px-6 py-5">
								<div className="mb-4 flex justify-between">
									<span className="text-sm font-semibold text-charcoal">Total</span>
									<span className="text-lg font-bold text-charcoal">
										{formatPrice(cart?.total ?? cart?.subtotal ?? 0, cart?.paymentCurrencyCode)}
									</span>
								</div>
								<Link
									href="/checkout"
									onClick={onClose}
									className="flex w-full items-center justify-center gap-3 bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent"
								>
									Checkout
									<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
									</svg>
								</Link>
								<Link
									href="/services"
									onClick={onClose}
									className="mt-3 flex w-full items-center justify-center border border-charcoal/10 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-cream"
								>
									Add More Services
								</Link>
							</div>
						)}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}

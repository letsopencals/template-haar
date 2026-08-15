'use client';

import { useCart } from '@/contexts/cart-context';
import { useCheckout } from '@/contexts/checkout-context';
import { formatPrice, formatDuration } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { useRef, useState } from 'react';

export function OrderSummary() {
	const { cart, applyDiscountCode, removeDiscountCode, discountCodeError, clearDiscountCodeError } = useCart();
	const { items, isExpired, timeRemaining, minutes, seconds, extendCart } = useCheckout();
	const { formatCustom } = useDateFormatter();
	const [promoOpen, setPromoOpen] = useState(false);
	const [promoCode, setPromoCode] = useState('');
	const [promoLoading, setPromoLoading] = useState(false);
	const promoInputRef = useRef<HTMLInputElement>(null);

	const handleApplyCode = async () => {
		if (!promoCode.trim()) return;
		setPromoLoading(true);
		try {
			const ok = await applyDiscountCode(promoCode.trim());
			if (ok) {
				setPromoCode('');
				setPromoOpen(false);
			}
		} finally {
			setPromoLoading(false);
		}
	};

	const handlePromoToggle = () => {
		clearDiscountCodeError();
		setPromoOpen((v) => !v);
		if (!promoOpen) {
			setTimeout(() => promoInputRef.current?.focus(), 0);
		}
	};

	if (!cart) return null;

	return (
		<div className="sticky top-28 space-y-6">
			{/* Cart timer */}
			{timeRemaining !== null && !isExpired && (
				<div
					className={`border px-4 py-3 text-center text-sm ${
						timeRemaining <= 60
							? 'border-red-200 bg-red-50 text-red-700'
							: timeRemaining <= 120
								? 'border-amber-200 bg-amber-50 text-amber-700'
								: 'border-charcoal/10 bg-cream/30 text-charcoal'
					}`}
				>
					Cart expires in{' '}
					<span className="font-semibold">
						{minutes}:{String(seconds).padStart(2, '0')}
					</span>
					{timeRemaining <= 120 && (
						<button onClick={extendCart} className="ml-2 font-medium underline">
							Extend
						</button>
					)}
				</div>
			)}

			{/* Order summary */}
			<div className="border border-charcoal/10 p-6">
				<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Order Summary</h3>
				<div className="mt-4 divide-y divide-charcoal/5">
					{items.map((item) => {
						const addOnItems = item.addOnItems ?? [];
						return (
							<div key={item.id} className="py-3">
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<p className="text-sm font-medium text-charcoal">
											{item.appointment?.product?.title ?? 'Service'}
										</p>
										{item.appointment?.from && (
											<p className="mt-0.5 text-xs text-warm-gray">
												{formatCustom(item.appointment.from, 'MMM D')}
												{' at '}
												{formatCustom(item.appointment.from, 'h:mm A')}
											</p>
										)}
										{item.appointment?.product?.duration && (
											<p className="mt-0.5 text-xs text-warm-gray">
												{formatDuration(item.appointment.product.duration)}
											</p>
										)}
									</div>
									<p className="text-sm font-semibold text-charcoal">
										{formatPrice(item.originalUnitPrice ?? 0, cart.paymentCurrencyCode)}
									</p>
								</div>
								{addOnItems.length > 0 && (
									<div className="mt-2 ml-3 space-y-1 border-l border-dashed border-charcoal/20 pl-3">
										{addOnItems.map((aoi) => (
											<div key={aoi.id} className="flex items-center justify-between text-xs text-warm-gray">
												<span>
													{aoi.addOn?.title ?? 'Add-on'}
													{aoi.quantity > 1 && ` × ${aoi.quantity}`}
												</span>
												<span className="font-medium text-charcoal">
													{formatPrice(aoi.discountedUnitPrice * aoi.quantity, cart.paymentCurrencyCode)}
												</span>
											</div>
										))}
									</div>
								)}
							</div>
						);
					})}
				</div>
				<div className="mt-4 border-t border-charcoal/10 pt-4">
					{/* Promo code */}
					{!cart.appliedDiscountCode && (
						<div className="mb-3">
							<button
								onClick={handlePromoToggle}
								className="text-xs font-medium uppercase tracking-[0.1em] text-warm-gray hover:text-charcoal"
							>
								{promoOpen ? '− Hide code' : '+ Have a promo code?'}
							</button>
							{promoOpen && (
								<div className="mt-2 flex gap-2">
									<input
										ref={promoInputRef}
										type="text"
										value={promoCode}
										onChange={(e) => { setPromoCode(e.target.value); clearDiscountCodeError(); }}
										onKeyDown={(e) => { if (e.key === 'Enter') void handleApplyCode(); }}
										placeholder="Enter code"
										className="flex-1 border border-charcoal/20 bg-white px-3 py-1.5 text-xs text-charcoal placeholder:text-warm-gray focus:border-charcoal focus:outline-none"
									/>
									<button
										onClick={() => void handleApplyCode()}
										disabled={promoLoading || !promoCode.trim()}
										className="border border-charcoal/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-charcoal transition-colors hover:bg-cream disabled:opacity-50"
									>
										{promoLoading ? '...' : 'Apply'}
									</button>
								</div>
							)}
							{discountCodeError && (
								<p className="mt-1 text-xs text-red-600">
									{discountCodeError.message ?? 'This code is not valid.'}
								</p>
							)}
						</div>
					)}

					{/* Applied discounts */}
					{cart.appliedDiscounts && cart.appliedDiscounts.length > 0 && (
						<div className="mb-2 space-y-1">
							{cart.appliedDiscounts.map((d) => (
								<div key={d.id} className="flex items-center justify-between text-xs">
									<span className="text-accent">
										{d.title}
										{d.code && (
											<button
												onClick={() => void removeDiscountCode()}
												className="ml-1 text-warm-gray underline hover:text-charcoal"
											>
												Remove
											</button>
										)}
									</span>
									<span className="font-medium text-accent">
										-{formatPrice(d.totalAmount, cart.paymentCurrencyCode)}
									</span>
								</div>
							))}
						</div>
					)}

					{cart.totalTax > 0 && (
						<div className="mb-2 flex justify-between text-xs text-warm-gray">
							<span>Tax</span>
							<span>{formatPrice(cart.totalTax, cart.paymentCurrencyCode)}</span>
						</div>
					)}
					<div className="flex justify-between">
						<span className="text-sm font-semibold text-charcoal">Total</span>
						<span className="text-lg font-bold text-charcoal">
							{formatPrice(cart.total ?? cart.subtotal ?? 0, cart.paymentCurrencyCode)}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

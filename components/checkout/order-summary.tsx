'use client';

import { useCart } from '@/contexts/cart-context';
import { useCheckout } from '@/contexts/checkout-context';
import { formatPrice, formatDuration } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';

export function OrderSummary() {
	const { cart } = useCart();
	const { items, isExpired, timeRemaining, minutes, seconds, extendCart } = useCheckout();
	const { formatCustom, formatSlot } = useDateFormatter();

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
					{items.map((item) => (
						<div key={item.id} className="flex items-start justify-between py-3">
							<div className="flex-1">
								<p className="text-sm font-medium text-charcoal">
									{item.appointment?.product?.title ?? 'Service'}
								</p>
								{item.appointment?.fromDate && (
									<p className="mt-0.5 text-xs text-warm-gray">
										{formatCustom(item.appointment.fromDate + 'T00:00:00', 'MMM D')}
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
							<p className="text-sm font-semibold text-charcoal">
								{formatPrice(item.originalUnitPrice ?? 0, cart.paymentCurrencyCode)}
							</p>
						</div>
					))}
				</div>
				<div className="mt-4 border-t border-charcoal/10 pt-4">
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

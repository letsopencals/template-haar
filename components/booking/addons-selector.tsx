'use client';

import type { AddOn } from '@opencals/storefront-sdk';
import { formatPrice } from '@/lib/format';

interface AddOnsSelectorProps {
	addOns: AddOn[];
	loading: boolean;
	selected: Map<string, number>;
	bookedDurationUnits: number;
	currency?: string;
	onChange: (addOnId: string, quantity: number) => void;
}

export function AddOnsSelector({
	addOns,
	loading,
	selected,
	bookedDurationUnits,
	currency,
	onChange,
}: AddOnsSelectorProps) {
	if (loading) {
		return (
			<div className="border border-charcoal/10 p-6">
				<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Add-ons</h3>
				<div className="mt-4 space-y-2">
					<div className="h-12 animate-pulse bg-cream" />
					<div className="h-12 animate-pulse bg-cream" />
				</div>
			</div>
		);
	}

	if (addOns.length === 0) {
		return (
			<div className="border border-charcoal/10 p-6">
				<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Add-ons</h3>
				<p className="mt-3 text-sm text-warm-gray">
					No add-ons available for this service.
				</p>
			</div>
		);
	}

	return (
		<div className="border border-charcoal/10 p-6">
			<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">
				Enhance Your Experience
			</h3>
			<p className="mt-2 text-xs text-warm-gray">Optional add-ons. Skip to continue without any.</p>
			<div className="mt-4 space-y-2">
				{addOns.map((addOn) => {
					const qty = selected.get(addOn.id) ?? 0;
					const isSelected = qty > 0;
					const isDuration = addOn.durationMultiplied;
					const displayPrice = isDuration ? addOn.price * bookedDurationUnits : addOn.price;
					const atMax =
						!isDuration && addOn.maxQuantity != null && qty >= addOn.maxQuantity;

					return (
						<div
							key={addOn.id}
							className="flex items-start justify-between gap-4 border border-charcoal/10 p-4 transition-colors hover:border-charcoal/30"
						>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-charcoal">
									{addOn.title ?? addOn.slug}
								</p>
								{addOn.description && (
									<p className="mt-0.5 text-xs text-warm-gray">{addOn.description}</p>
								)}
								<p className="mt-1 text-sm font-semibold text-charcoal">
									{formatPrice(displayPrice, currency)}
									{isDuration && (
										<span className="ml-1 text-xs font-normal text-warm-gray">
											({formatPrice(addOn.price, currency)} × {bookedDurationUnits})
										</span>
									)}
								</p>
							</div>

							<div className="flex shrink-0 items-center gap-1">
								{isDuration ? (
									<button
										type="button"
										onClick={() => onChange(addOn.id, isSelected ? 0 : 1)}
										className={`border px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
											isSelected
												? 'border-charcoal bg-charcoal text-white'
												: 'border-charcoal/20 text-charcoal hover:border-charcoal/40'
										}`}
									>
										{isSelected ? 'Added' : 'Add'}
									</button>
								) : isSelected ? (
									<>
										<button
											type="button"
											onClick={() => onChange(addOn.id, qty - 1)}
											className="flex h-8 w-8 items-center justify-center border border-charcoal/20 text-charcoal transition-colors hover:bg-cream"
											aria-label="Decrease quantity"
										>
											<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
											</svg>
										</button>
										<span className="w-6 text-center text-sm font-semibold text-charcoal">{qty}</span>
										<button
											type="button"
											disabled={atMax}
											onClick={() => onChange(addOn.id, qty + 1)}
											className="flex h-8 w-8 items-center justify-center border border-charcoal/20 text-charcoal transition-colors hover:bg-cream disabled:opacity-30"
											aria-label="Increase quantity"
										>
											<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
												<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
											</svg>
										</button>
									</>
								) : (
									<button
										type="button"
										onClick={() => onChange(addOn.id, 1)}
										className="border border-charcoal/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-charcoal transition-colors hover:bg-cream"
									>
										Add
									</button>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

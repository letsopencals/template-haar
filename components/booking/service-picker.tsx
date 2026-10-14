'use client';

import { useId } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ProductListVariant, ProductListVariantLocation } from '@opencals/storefront-sdk';
import { formatDuration, formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { SPRING_SOFT } from '@/components/motion/easing';
import { salonName } from '@/components/services/location-filter';

interface ServicePickerProps {
	variants: ProductListVariant[];
	hasVariants: boolean;
	selectedVariantId: string | null;
	onSelectVariant: (id: string) => void;
	locations: ProductListVariantLocation[];
	selectedLocationId: string | null;
	onSelectLocation: (id: string) => void;
	currency: string;
	onContinue: () => void;
}

/** Section 01: the option (variant chips with a sliding highlight) and, with several salons, where. */
export function ServicePicker({
	variants,
	hasVariants,
	selectedVariantId,
	onSelectVariant,
	locations,
	selectedLocationId,
	onSelectLocation,
	currency,
	onContinue,
}: ServicePickerProps) {
	const variantGroup = useId();
	const locationGroup = useId();

	return (
		<div className="space-y-9">
			{hasVariants ? (
				<fieldset>
					<legend className="eyebrow text-warm-gray">Choose your option</legend>
					<LayoutGroup id={variantGroup}>
						<div className="mt-4 grid gap-2 sm:grid-cols-2">
							{variants.map((variant) => {
								const active = variant.id === selectedVariantId;
								return (
									<button
										key={variant.id}
										type="button"
										aria-pressed={active}
										onClick={() => onSelectVariant(variant.id)}
										className={clsx(
											'relative flex items-baseline border px-4 py-3.5 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
											active ? 'border-charcoal text-cream' : 'border-line text-charcoal hover:border-charcoal/50',
										)}
									>
										{active ? (
											<motion.span layoutId="variant-fill" transition={SPRING_SOFT} className="absolute inset-0 bg-charcoal" aria-hidden />
										) : null}
										<span className="relative font-display text-lg">{variant.variantTitle || variant.title}</span>
										<span className={clsx('leader-line relative', active && 'opacity-30')} aria-hidden />
										<span className={clsx('tabular relative shrink-0 text-xs', active ? 'text-cream/70' : 'text-warm-gray')}>
											{formatDuration(variant.duration)}
										</span>
										<span className="tabular relative ml-3 shrink-0 text-sm">{formatPrice(variant.price, currency)}</span>
									</button>
								);
							})}
						</div>
					</LayoutGroup>
				</fieldset>
			) : null}

			{locations.length > 1 ? (
				<fieldset>
					<legend className="eyebrow text-warm-gray">Which salon</legend>
					<LayoutGroup id={locationGroup}>
						<div className="mt-4 flex flex-wrap gap-x-7 gap-y-3 border-b border-line" role="group">
							{locations.map((location) => {
								const active = location.id === selectedLocationId;
								return (
									<button
										key={location.id}
										type="button"
										aria-pressed={active}
										onClick={() => onSelectLocation(location.id)}
										className={clsx(
											'relative pb-3 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent',
											active ? 'text-charcoal' : 'text-warm-gray hover:text-charcoal',
										)}
									>
										<span className={clsx('font-display text-xl', active && 'italic')}>{salonName(location)}</span>
										{location.addressLine1 ? <span className="mt-0.5 block text-xs text-warm-gray">{location.addressLine1}</span> : null}
										{active ? (
											<motion.span layoutId="location-rule" transition={SPRING_SOFT} className="absolute right-0 -bottom-px left-0 h-0.5 bg-brass" aria-hidden />
										) : null}
									</button>
								);
							})}
						</div>
					</LayoutGroup>
				</fieldset>
			) : null}

			<Button variant="primary" size="md" onClick={onContinue} disabled={!selectedVariantId}>
				Continue
				<span aria-hidden>&rarr;</span>
			</Button>
		</div>
	);
}

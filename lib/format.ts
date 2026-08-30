import type { AddOnListItemResponse as AddOn } from '@opencals/storefront-sdk';

/** Minimal shape shared by the various product/variant responses that carry imagery. */
interface WithImages {
	image?: { url?: string | null } | null;
	images?: Array<{ url?: string | null }> | null;
}

export function formatDuration(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
	if (hours > 0) return `${hours}h`;
	return `${minutes} min`;
}

export function formatPrice(amount: number, currency = 'USD'): string {
	if (amount === 0) return 'Free';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(amount);
}

export function getProductImage(product: WithImages | undefined | null): string | null {
	return product?.image?.url ?? product?.images?.[0]?.url ?? null;
}

/**
 * Compute the total price for a selected add-on at booking time.
 * For `durationMultiplied` add-ons, the per-unit price is multiplied by `durationUnits`
 * (the number of base-duration units the parent appointment spans).
 */
export function computeAddOnLineTotal(
	addOn: Pick<AddOn, 'price' | 'durationMultiplied'>,
	quantity: number,
	durationUnits: number,
): number {
	const unit = addOn.durationMultiplied ? addOn.price * durationUnits : addOn.price;
	return unit * quantity;
}

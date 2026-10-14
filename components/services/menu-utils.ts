import type { ProductListItemResponse as Product, ProductListVariant as Variant } from '@opencals/storefront-sdk';
import { formatDuration, getProductImage } from '@/lib/format';

export function productVariants(product: Product): Variant[] {
	return product.variants?.length ? product.variants : [];
}

/** Lowest price across the variants (or the product's own price). */
export function fromPrice(product: Product): number {
	const prices = productVariants(product).map((v) => v.price);
	return prices.length ? Math.min(...prices) : product.price;
}

/** "45 min – 1h 30min", or a single duration when every option takes the same time. */
export function durationRange(product: Product): string {
	const durations = productVariants(product).map((v) => v.duration);
	if (!durations.length) return formatDuration(product.duration);
	const min = Math.min(...durations);
	const max = Math.max(...durations);
	return min === max ? formatDuration(min) : `${formatDuration(min)} – ${formatDuration(max)}`;
}

export function productImage(product: Product): string | null {
	return getProductImage(product as Parameters<typeof getProductImage>[0]) ?? getProductImage(productVariants(product)[0]);
}

/** Options sorted cheapest first, so the menu reads like a price list. */
export function sortedVariants(product: Product): Variant[] {
	return [...productVariants(product)].sort((a, b) => a.price - b.price);
}

/** Query string carried from The Menu into the composer (`?staff=&location=`). */
export function bookingHref(variantSlug: string, opts: { staffId?: string | null; locationId?: string | null }): string {
	const params = new URLSearchParams();
	if (opts.staffId) params.set('staff', opts.staffId);
	if (opts.locationId) params.set('location', opts.locationId);
	const qs = params.toString();
	return `/booking/${variantSlug}${qs ? `?${qs}` : ''}`;
}

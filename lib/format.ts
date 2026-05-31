import type { Product } from '@opencals/storefront-sdk';

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

export function getProductImage(product: Product | undefined): string | null {
	return product?.image?.url ?? product?.images?.[0]?.url ?? null;
}

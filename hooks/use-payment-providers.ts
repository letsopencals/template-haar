'use client';

import useSWR from 'swr';
import type { CustomerProviderCatalogItem } from '@opencals/storefront-sdk';

/**
 * Payment providers for the current cart. Cart-aware: a fully discounted /
 * sub-minimum cart comes back as a single `no_payment_required` provider, so
 * the key includes the cart id and revalidates once the cart exists. Split out
 * of checkout-context so the context orchestrates rather than fetches.
 */
export function usePaymentProviders(cartId: string | null): CustomerProviderCatalogItem[] {
	const { data } = useSWR<CustomerProviderCatalogItem[]>(
		['/api/payment/providers', cartId],
		([url, id]) =>
			fetch(url, id ? { headers: { 'X-Cart-Id': id as string } } : undefined).then((res) =>
				res.ok ? res.json() : [],
			),
		{ revalidateOnFocus: false },
	);
	return Array.isArray(data) ? data : [];
}

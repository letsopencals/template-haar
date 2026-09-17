import '@/lib/opencals';
import { cache } from 'react';
import {
	StoreService,
	ProductService,
	type StorePublicSettings,
	type ProductListItemResponse,
	type ProductSlugResponse,
} from '@opencals/storefront-sdk';

/**
 * Server-only data readers. Each is wrapped in React.cache() so repeated calls
 * within a single request are deduped. RSCs call these directly instead of
 * going through the template's own /api/* routes. Never import this module from
 * a 'use client' file — the /api/* routes remain the client/SWR data source.
 */

export const getStoreSettings = cache(async (): Promise<StorePublicSettings | null> => {
	try {
		const { data } = await StoreService.getStorePublicSettings();
		return data ?? null;
	} catch {
		return null;
	}
});

export const getProducts = cache(
	async (locationId?: string): Promise<ProductListItemResponse[]> => {
		try {
			const { data } = await ProductService.list({ query: { take: 50, locationId } });
			return data?.data ?? [];
		} catch {
			return [];
		}
	},
);

export const getProduct = cache(
	async (slug: string): Promise<ProductSlugResponse | null> => {
		try {
			const { data } = await ProductService.getBySlug({ path: { slug } });
			return data ?? null;
		} catch {
			return null;
		}
	},
);

'use client';

import { useState } from 'react';
import useSWR from 'swr';
import type { ProductListItemResponse, ProductListVariant } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';

interface UseProductDataResult {
	product: ProductListItemResponse | null;
	activeVariant: ProductListVariant | null;
	variants: ProductListVariant[];
	hasVariants: boolean;
	selectedVariantId: string | null;
	setSelectedVariantId: (id: string | null) => void;
	loading: boolean;
	error: string | null;
}

export function useProductData(
	slug: string,
	initialProduct: ProductListItemResponse | null = null,
): UseProductDataResult {
	// SWR dedupes/caches the fetch and is seeded with the server-rendered product
	// so there's no loading flash on first paint.
	const { data, error, isLoading } = useSWR<ProductListItemResponse>(
		slug ? `/api/products/${slug}` : null,
		fetcher,
		{ fallbackData: initialProduct ?? undefined, revalidateOnFocus: false },
	);

	const product = data ?? null;
	const variants: ProductListVariant[] = product?.variants ?? [];
	const hasVariants = variants.length > 0;

	// Default the selected variant to the first one, but let the caller override.
	const [overrideVariantId, setSelectedVariantId] = useState<string | null>(null);
	const selectedVariantId = overrideVariantId ?? variants[0]?.id ?? null;

	const activeVariant: ProductListVariant | null = hasVariants
		? variants.find((v) => v.id === selectedVariantId) || variants[0] || null
		: null;

	return {
		product,
		activeVariant,
		variants,
		hasVariants,
		selectedVariantId,
		setSelectedVariantId,
		loading: isLoading && !product,
		error: error ? (error instanceof Error ? error.message : 'Service not found.') : null,
	};
}

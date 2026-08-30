'use client';

import { useState, useEffect } from 'react';
import type { ProductListItemResponse, ProductListVariant } from '@opencals/storefront-sdk';

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

export function useProductData(slug: string): UseProductDataResult {
	const [product, setProduct] = useState<ProductListItemResponse | null>(null);
	const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function fetchProduct() {
			try {
				const res = await fetch(`/api/products/${slug}`);
				if (!res.ok) {
					const data = await res.json().catch(() => null);
					throw new Error(data?.error || 'Service not found');
				}
				const data = await res.json();
				if (cancelled) return;
				setProduct(data);
				const firstVariantId = data?.variants?.[0]?.id ?? null;
				if (firstVariantId) setSelectedVariantId(firstVariantId);
			} catch (err) {
				if (cancelled) return;
				setError(err instanceof Error ? err.message : 'Service not found.');
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		fetchProduct();
		return () => { cancelled = true; };
	}, [slug]);

	const variants: ProductListVariant[] = product?.variants ?? [];
	const hasVariants = variants.length > 0;
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
		loading,
		error,
	};
}

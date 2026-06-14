'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@opencals/storefront-sdk';

interface UseProductDataResult {
	product: Product | null;
	activeVariant: Product | null;
	variants: Product[];
	hasVariants: boolean;
	selectedVariantId: string | null;
	setSelectedVariantId: (id: string | null) => void;
	loading: boolean;
	error: string | null;
}

export function useProductData(slug: string): UseProductDataResult {
	const [product, setProduct] = useState<Product | null>(null);
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

	const variants = product?.variants ?? [];
	const hasVariants = variants.length > 0;
	const activeVariant: Product | null = hasVariants
		? variants.find((v) => v.id === selectedVariantId) || null
		: product;

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

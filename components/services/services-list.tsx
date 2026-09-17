'use client';

import useSWR from 'swr';
import type { ProductListItemResponse as Product } from '@opencals/storefront-sdk';
import { useLocation } from '@/contexts/location-context';
import { fetcher } from '@/lib/fetcher';
import { ServiceCard, ServiceCardSkeleton } from './service-card';

interface ProductListResponse {
	data?: Product[];
}

export function ServicesList({ initialProducts }: { initialProducts: Product[] }) {
	const { selectedLocationId, setSelectedLocationId } = useLocation();

	const params = new URLSearchParams();
	if (selectedLocationId) params.set('locationId', selectedLocationId);
	const key = `/api/products?${params.toString()}`;

	const { data, error, isLoading } = useSWR<ProductListResponse>(key, fetcher, {
		// Server-rendered products seed the "All locations" view so there's no
		// spinner on first paint; filtering by location revalidates via SWR.
		fallbackData: selectedLocationId ? undefined : { data: initialProducts },
		revalidateOnFocus: false,
		onError: () => {
			// An invalid saved location id 400s — reset to "all locations".
			if (selectedLocationId) setSelectedLocationId(null);
		},
	});

	const products = data?.data ?? [];

	if (isLoading && products.length === 0) {
		return (
			<>
				{[0, 1, 2].map((i) => (
					<ServiceCardSkeleton key={i} index={i} />
				))}
			</>
		);
	}

	if (error && products.length === 0) {
		return (
			<div className="py-20 text-center">
				<p className="text-warm-gray">Unable to load services. Please try again later.</p>
			</div>
		);
	}

	if (products.length === 0) {
		return (
			<div className="py-20 text-center">
				<p className="text-warm-gray">No services available at the moment.</p>
			</div>
		);
	}

	return (
		<>
			{products.map((product, i) => (
				<ServiceCard key={product.id} product={product} index={i} />
			))}
		</>
	);
}

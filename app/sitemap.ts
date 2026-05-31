import type { MetadataRoute } from 'next';
import { Product, productList } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import '@/lib/opencals';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = siteConfig.url;

	const staticRoutes: MetadataRoute.Sitemap = [
		{url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1},
		{url: `${base}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9},
		{url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7},
		{url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7},
	];

	try {
		const response = await productList({query: {take: 50}});
		if (!response.error && response.data) {
			const products = response.data.data as Product[];
			const productRoutes: MetadataRoute.Sitemap = products
			.flatMap((p: Product) => p.variants as Product[])
			.map((p) => ({
				url: `${base}/booking/${p.slug}`,
				lastModified: new Date(),
				changeFrequency: 'weekly' as const,
				priority: 0.8,
			}));
			return [...staticRoutes, ...productRoutes];
		}
	} catch {
		// SDK not available — return static routes only
	}

	return staticRoutes;
}

import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
			disallow: ['/account/', '/checkout/', '/api/', '/auth/'],
		},
		sitemap: `${siteConfig.url}/sitemap.xml`,
	};
}

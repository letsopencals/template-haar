import '@/lib/opencals';
import { cache } from 'react';
import {
	StoreService,
	ProductService,
	StaffMemberService,
	LocationService,
	type StorePublicSettings,
	type ProductListItemResponse,
	type ProductSlugResponse,
} from '@opencals/storefront-sdk';
import { publicPayload } from '@/lib/public-payload';

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
			return publicPayload(data?.data ?? []);
		} catch {
			return [];
		}
	},
);

export const getProduct = cache(
	async (slug: string): Promise<ProductSlugResponse | null> => {
		try {
			const { data } = await ProductService.getBySlug({ path: { slug } });
			return data ? publicPayload(data) : null;
		} catch {
			return null;
		}
	},
);

/** Public-safe stylist card: names, portrait and what/where they work. No ids beyond the staff id. */
export interface PublicStylist {
	id: string;
	firstName: string;
	lastName: string;
	slug: string;
	imageUrl: string | null;
	/** Distinct product titles this stylist performs (e.g. "Balayage & Highlights"). */
	specialties: string[];
	/** Location titles this stylist works at. */
	locations: string[];
}

export const getStylists = cache(async (): Promise<PublicStylist[]> => {
	try {
		const { data } = await StaffMemberService.list({ query: { take: 100 } });
		return (data?.data ?? []).map((s) => ({
			id: s.id,
			firstName: s.firstName ?? '',
			lastName: s.lastName ?? '',
			slug: s.slug,
			imageUrl: s.image?.url ?? null,
			specialties: [...new Set((s.products ?? []).map((p) => p.title).filter((t): t is string => !!t))],
			locations: [...new Set((s.locations ?? []).map((l) => l.title).filter((t): t is string => !!t))],
		}));
	} catch {
		return [];
	}
});

/** Public-safe salon address card. */
export interface PublicLocation {
	id: string;
	title: string;
	addressLines: string[];
}

export const getPhysicalLocations = cache(async (): Promise<PublicLocation[]> => {
	try {
		const { data } = await LocationService.list({ query: { take: 50 } });
		return (data?.data ?? [])
			.filter((l) => l.type === 'physical')
			.map((l) => {
				const cityLine = [l.city, [l.state, l.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ');
				const display = l.displayAddress;
				return {
					id: l.id,
					title: l.title ?? 'HAAR Salon',
					addressLines: display
						? splitDisplayAddress(display)
						: [l.addressLine1, l.addressLine2, cityLine].filter((x): x is string => !!x),
				};
			});
	} catch {
		return [];
	}
});

function splitDisplayAddress(display: string): string[] {
	const lines = display.split('\n').map((x) => x.trim()).filter(Boolean);
	if (lines.length > 1) return lines;
	const [first, ...rest] = display.split(',');
	return [(first ?? '').trim(), rest.join(',').trim()].filter(Boolean);
}

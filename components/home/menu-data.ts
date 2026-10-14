import type { ProductListItemResponse } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';
import { getProductImage } from '@/lib/format';

/** One row of the home "Menu" — a product with its cheapest option. Serializable (RSC → client). */
export interface MenuEntry {
	key: string;
	title: string;
	description: string;
	/** Lowest variant price; null for the siteConfig fallback. */
	fromPrice: number | null;
	/** Seconds. */
	minDuration: number | null;
	maxDuration: number | null;
	imageUrl: string | null;
	href: string;
	/** Variant titles ("Express · Classic · Premium"). */
	options: string[];
	/** Product slug of the cheapest variant — used to match imagery (e.g. "scalp"). */
	slug: string;
}

function firstSentence(text: string | null | undefined): string {
	if (!text) return '';
	const clean = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
	const m = clean.match(/^.{20,180}?[.!?](\s|$)/);
	return (m ? m[0] : clean.slice(0, 160)).trim();
}

/**
 * Collapses the product list (one item per product, variants nested) into menu
 * rows. Falls back to the curated `siteConfig.services` copy (no prices) when the
 * API is unreachable, so the home page never renders an empty menu.
 */
export function buildMenu(products: ProductListItemResponse[]): MenuEntry[] {
	if (products.length === 0) {
		return siteConfig.services.map((s) => ({
			key: s.href,
			title: s.title,
			description: s.description,
			fromPrice: null,
			minDuration: null,
			maxDuration: null,
			imageUrl: null,
			href: '/services',
			options: [],
			slug: s.href.replace('/booking/', ''),
		}));
	}

	return products.map((p) => {
		const variants = p.variants?.length ? p.variants : [p];
		const cheapest = variants.reduce((a, b) => (b.price < a.price ? b : a), variants[0]!);
		const durations = variants.map((v) => v.duration).filter((d): d is number => typeof d === 'number' && d > 0);
		return {
			key: p.productId ?? p.id,
			title: cheapest.title || p.title,
			description: firstSentence(cheapest.description || p.description),
			fromPrice: cheapest.price,
			minDuration: durations.length ? Math.min(...durations) : null,
			maxDuration: durations.length ? Math.max(...durations) : null,
			imageUrl: getProductImage(cheapest) ?? getProductImage(p),
			href: `/booking/${cheapest.slug}`,
			options: [...variants].sort((a, b) => a.price - b.price).map((v) => v.variantTitle).filter((t): t is string => !!t),
			slug: cheapest.slug,
		};
	});
}

/** "$180" (no cents for whole amounts). */
export function formatFromPrice(amount: number, currency = 'USD'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
	}).format(amount);
}

/** "45 min" / "1h 30" / "45–90 min". */
export function formatDurationRange(min: number | null, max: number | null): string | null {
	if (!min) return null;
	const fmt = (s: number) => {
		const h = Math.floor(s / 3600);
		const m = Math.round((s % 3600) / 60);
		if (!h) return `${m} min`;
		return m ? `${h}h ${String(m).padStart(2, '0')}` : `${h}h`;
	};
	return max && max !== min ? `${fmt(min)} – ${fmt(max)}` : fmt(min);
}

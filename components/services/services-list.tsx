'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import type { ProductListItemResponse as Product } from '@opencals/storefront-sdk';
import { useLocation } from '@/contexts/location-context';
import { useSettings } from '@/contexts/settings-context';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';
import { fetcher } from '@/lib/fetcher';
import { getStaffName } from '@/lib/staff-utils';
import { MenuRow } from './menu-row';
import { MenuIndex } from './menu-index';
import { MenuHoverPreview } from './menu-hover-preview';
import { sortedVariants } from './menu-utils';

interface ProductListResponse {
	data?: Product[];
}

interface ServicesListProps {
	initialProducts: Product[];
	/** `?staff=` — only show options this stylist offers, and carry them into the composer. */
	staffId?: string | null;
}

/**
 * The Menu: SWR list (seeded by the RSC for "All salons", revalidated per salon)
 * with a sticky contents rail on desktop and a cursor-trailing arch preview.
 */
export function ServicesList({ initialProducts, staffId = null }: ServicesListProps) {
	const { currency } = useSettings();
	const { selectedLocationId, setSelectedLocationId } = useLocation();
	const lenis = useSmoothScroll();

	const params = new URLSearchParams();
	if (selectedLocationId) params.set('locationId', selectedLocationId);
	const key = `/api/products?${params.toString()}`;

	const { data, error, isLoading } = useSWR<ProductListResponse>(key, fetcher, {
		fallbackData: selectedLocationId ? undefined : { data: initialProducts },
		revalidateOnFocus: false,
		onError: () => {
			// An invalid saved location id 400s — reset to "all salons".
			if (selectedLocationId) setSelectedLocationId(null);
		},
	});

	// Options per product, narrowed to the `?staff=` stylist when present.
	const rows = useMemo(() => {
		const products = data?.data ?? [];
		return products
			.map((product) => {
				const all = sortedVariants(product);
				const variants = staffId ? all.filter((v) => v.staffMembers?.some((s) => s.id === staffId)) : all;
				return { product, variants };
			})
			.filter((r) => r.variants.length > 0);
	}, [data, staffId]);

	const stylist = useMemo(() => {
		if (!staffId) return null;
		for (const p of data?.data ?? initialProducts) {
			for (const v of p.variants ?? []) {
				const s = v.staffMembers?.find((m) => m.id === staffId);
				if (s) return s;
			}
		}
		return null;
	}, [data, initialProducts, staffId]);

	const [expandedSlug, setExpandedSlug] = useState<string | null>(() => rows[0]?.product.slug ?? null);
	const [activeSlug, setActiveSlug] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	const toggle = useCallback((slug: string) => {
		setExpandedSlug((cur) => (cur === slug ? null : slug));
		setPreview(null);
	}, []);

	const jump = useCallback(
		(slug: string) => {
			setExpandedSlug(slug);
			const el = document.getElementById(`menu-${slug}`);
			if (!el) return;
			if (lenis) lenis.scrollTo(el, { offset: -120, duration: 1.1 });
			else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		},
		[lenis],
	);

	// Ink the rail entry for the row nearest the top of the viewport.
	const slugs = rows.map((r) => r.product.slug).join('|');
	useEffect(() => {
		const els = slugs
			.split('|')
			.filter(Boolean)
			.map((s) => document.getElementById(`menu-${s}`))
			.filter((el): el is HTMLElement => !!el);
		if (!els.length) return;
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) setActiveSlug(visible[0].target.id.replace(/^menu-/, ''));
			},
			{ rootMargin: '-25% 0px -60% 0px' },
		);
		els.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, [slugs]);

	if (isLoading && rows.length === 0) return <MenuSkeleton />;

	if (error && rows.length === 0) {
		return <EmptyNote>We couldn&rsquo;t load the menu just now. Please try again in a moment.</EmptyNote>;
	}

	if (rows.length === 0) {
		return (
			<EmptyNote>
				{stylist ? `${getStaffName(stylist)} has no services at this salon.` : 'No services at this salon yet.'}
			</EmptyNote>
		);
	}

	return (
		<div className="grid gap-12 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-20">
			<div className="hidden lg:block">
				<MenuIndex products={rows.map((r) => r.product)} activeSlug={activeSlug ?? rows[0]?.product.slug ?? null} onJump={jump} />
			</div>

			<div>
				{stylist ? (
					<div className="mb-6 flex flex-wrap items-baseline justify-between gap-3 border border-line bg-cream px-5 py-4">
						<p className="text-sm text-charcoal">
							<span className="eyebrow mr-3 text-warm-gray">In the chair</span>
							<span className="font-display text-lg italic">{getStaffName(stylist)}</span>
						</p>
						<Link href="/services" className="link-underline eyebrow text-charcoal">
							Show every stylist
						</Link>
					</div>
				) : null}

				<div className="border-t border-line-strong">
					{rows.map(({ product, variants }, i) => (
						<MenuRow
							key={product.id}
							product={product}
							variants={variants}
							index={i}
							expanded={expandedSlug === product.slug}
							onToggle={toggle}
							onPreview={setPreview}
							currency={currency}
							staffId={staffId}
							locationId={selectedLocationId}
						/>
					))}
				</div>
			</div>

			<MenuHoverPreview src={preview} />
		</div>
	);
}

function EmptyNote({ children }: { children: React.ReactNode }) {
	return (
		<div className="border-y border-line py-20 text-center">
			<p className="font-display text-2xl italic text-warm-gray">{children}</p>
		</div>
	);
}

function MenuSkeleton() {
	return (
		<div className="border-t border-line-strong" aria-busy="true" aria-label="Loading the menu">
			{[0, 1, 2, 3].map((i) => (
				<div key={i} className="flex items-baseline gap-5 border-b border-line py-9">
					<div className="h-3 w-6 animate-pulse bg-cream-dark" />
					<div className="h-8 flex-1 animate-pulse bg-cream-dark" />
					<div className="h-4 w-20 animate-pulse bg-cream-dark" />
				</div>
			))}
		</div>
	);
}

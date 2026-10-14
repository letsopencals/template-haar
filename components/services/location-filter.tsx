'use client';

import { LayoutGroup, motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { Location } from '@opencals/storefront-sdk';
import { useLocation } from '@/contexts/location-context';
import { SPRING_SOFT } from '@/components/motion/easing';

/** "HAAR Salon — New York" → "New York" (city when the API has it). */
export function salonName(location: Pick<Location, 'title' | 'city'>): string {
	if (location.city) return location.city;
	const title = location.title ?? 'Salon';
	const parts = title.split(/\s+[—–-]\s+/);
	return parts[parts.length - 1] ?? title;
}

/**
 * Underline tabs for the global salon filter (shared with the footer selector
 * via the location context / localStorage). A brass rule slides under the active tab.
 */
export function LocationFilter() {
	const { locations, selectedLocationId, setSelectedLocationId, loading } = useLocation();

	if (loading || locations.length <= 1) {
		// Reserve the row so the list doesn't jump when locations arrive.
		return <div className="h-10" aria-hidden />;
	}

	const tabs: Array<{ id: string | null; label: string }> = [
		{ id: null, label: 'All salons' },
		...locations.map((l) => ({ id: l.id, label: salonName(l) })),
	];

	return (
		<LayoutGroup id="menu-location">
			<div role="tablist" aria-label="Filter by salon" className="no-scrollbar -mx-1 flex gap-7 overflow-x-auto px-1">
				{tabs.map((tab) => {
					const active = selectedLocationId === tab.id;
					return (
						<button
							key={tab.id ?? 'all'}
							type="button"
							role="tab"
							aria-selected={active}
							onClick={() => setSelectedLocationId(tab.id)}
							className={clsx(
								'eyebrow relative shrink-0 py-3 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
								active ? 'text-charcoal' : 'text-warm-gray hover:text-charcoal',
							)}
						>
							{tab.label}
							{active ? (
								<motion.span layoutId="menu-location-rule" transition={SPRING_SOFT} className="absolute inset-x-0 bottom-0 h-px bg-brass" />
							) : null}
						</button>
					);
				})}
			</div>
		</LayoutGroup>
	);
}

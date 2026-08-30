'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProductListVariantLocation as Location } from '@opencals/storefront-sdk';

interface LocationSelectorProps {
	locations: Location[];
	selected: string | null;
	onSelect: (locationId: string) => void;
}

function formatAddress(location: Location): string | null {
	if (location.type === 'online') return 'Online';
	const parts = [location.addressLine1, location.city].filter(Boolean);
	return parts.length > 0 ? parts.join(', ') : null;
}

export function LocationSelector({ locations, selected, onSelect }: LocationSelectorProps) {
	const [expanded, setExpanded] = useState(!selected);

	if (locations.length === 0) return null;

	// Auto-select first if nothing selected
	const activeLocation = (locations.find((l) => l.id === selected) ?? locations[0]) as Location;

	// If only one location, show it but don't allow editing
	if (locations.length === 1) {
		return (
			<div className="border border-charcoal/10 p-4">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center bg-cream text-charcoal">
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
							<path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</div>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-medium text-charcoal">{activeLocation.title ?? 'Location'}</p>
						{formatAddress(activeLocation) && (
							<p className="truncate text-xs text-warm-gray">{formatAddress(activeLocation)}</p>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="border border-charcoal/10">
			{/* Collapsed view */}
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-cream/30"
			>
				<div className="flex h-9 w-9 items-center justify-center bg-cream text-charcoal">
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
						<path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-charcoal">{activeLocation.title ?? 'Location'}</p>
					{formatAddress(activeLocation) && (
						<p className="truncate text-xs text-warm-gray">{formatAddress(activeLocation)}</p>
					)}
				</div>
				<svg
					className={`h-4 w-4 text-warm-gray transition-transform ${expanded ? 'rotate-180' : ''}`}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{/* Expanded — location options */}
			<AnimatePresence>
				{expanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: 'auto', opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden border-t border-charcoal/5"
					>
						<div className="space-y-1 p-2">
							{locations.map((location) => {
								const isActive = location.id === activeLocation.id;
								return (
									<button
										key={location.id}
										type="button"
										onClick={() => {
											onSelect(location.id);
											setExpanded(false);
										}}
										className={`flex w-full items-center gap-3 rounded p-3 text-left transition-colors ${
											isActive ? 'bg-cream/50' : 'hover:bg-cream/30'
										}`}
									>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm text-charcoal">{location.title ?? 'Location'}</p>
											{formatAddress(location) && (
												<p className="truncate text-xs text-warm-gray">{formatAddress(location)}</p>
											)}
										</div>
										{isActive && (
											<div className="h-1.5 w-1.5 rounded-full bg-accent" />
										)}
									</button>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

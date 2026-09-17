'use client';

import { motion } from 'framer-motion';
import { useLocation } from '@/contexts/location-context';

const FILTER_INITIAL = { opacity: 0, y: 10 };
const FILTER_ANIMATE = { opacity: 1, y: 0 };
const FILTER_TRANSITION = { duration: 0.5, delay: 0.5 };

export function LocationFilter() {
	const { locations, selectedLocationId, setSelectedLocationId, loading: locationsLoading } = useLocation();

	if (locationsLoading || locations.length <= 1) return null;

	return (
		<motion.div initial={FILTER_INITIAL} animate={FILTER_ANIMATE} transition={FILTER_TRANSITION} className="mt-10">
			<div className="flex flex-wrap items-center gap-3">
				<button
					onClick={() => setSelectedLocationId(null)}
					className={`border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all ${
						selectedLocationId === null
							? 'border-charcoal bg-charcoal text-white'
							: 'border-charcoal/10 text-charcoal hover:border-charcoal/30'
					}`}
				>
					All Locations
				</button>
				{locations.map((location) => (
					<button
						key={location.id}
						onClick={() => setSelectedLocationId(location.id)}
						className={`border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all ${
							selectedLocationId === location.id
								? 'border-charcoal bg-charcoal text-white'
								: 'border-charcoal/10 text-charcoal hover:border-charcoal/30'
						}`}
					>
						{location.title ?? 'Location'}
					</button>
				))}
			</div>
		</motion.div>
	);
}

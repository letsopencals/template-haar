'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Location } from '@opencals/storefront-sdk';

const LOCATION_KEY = '@opencals/location';

interface LocationContextValue {
	locations: Location[];
	selectedLocationId: string | null;
	selectedLocation: Location | null;
	setSelectedLocationId: (id: string | null) => void;
	loading: boolean;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
	const [locations, setLocations] = useState<Location[]>([]);
	const [selectedLocationId, setSelectedLocationIdState] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	// Load saved location from localStorage
	useEffect(() => {
		const stored = localStorage.getItem(LOCATION_KEY);
		if (stored) setSelectedLocationIdState(stored);
	}, []);

	// Fetch locations on mount
	useEffect(() => {
		async function fetchLocations() {
			try {
				const res = await fetch('/api/locations');
				if (res.ok) {
					const data = await res.json();
					setLocations(Array.isArray(data) ? data : data.data ?? []);
				}
			} catch {
				// locations will be empty
			} finally {
				setLoading(false);
			}
		}
		fetchLocations();
	}, []);

	const setSelectedLocationId = useCallback((id: string | null) => {
		setSelectedLocationIdState(id);
		if (id) {
			localStorage.setItem(LOCATION_KEY, id);
		} else {
			localStorage.removeItem(LOCATION_KEY);
		}
	}, []);

	const selectedLocation = locations.find((l) => l.id === selectedLocationId) ?? null;

	return (
		<LocationContext.Provider value={{ locations, selectedLocationId, selectedLocation, setSelectedLocationId, loading }}>
			{children}
		</LocationContext.Provider>
	);
}

export function useLocation(): LocationContextValue {
	const ctx = useContext(LocationContext);
	if (!ctx) throw new Error('useLocation must be used within LocationProvider');
	return ctx;
}

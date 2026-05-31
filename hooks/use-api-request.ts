'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseApiRequestOptions {
	/** Fetch automatically on mount (default: true) */
	autoFetch?: boolean;
	/** Additional headers */
	headers?: Record<string, string>;
}

interface UseApiRequestResult<T> {
	data: T | null;
	error: string | null;
	loading: boolean;
	refetch: () => Promise<void>;
}

/**
 * Generic hook for fetching data from API routes.
 * Replaces repetitive useCallback + fetch + useState patterns.
 */
export function useApiRequest<T>(url: string | null, options: UseApiRequestOptions = {}): UseApiRequestResult<T> {
	const { autoFetch = true, headers } = options;
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(autoFetch && !!url);
	const abortRef = useRef<AbortController | null>(null);

	const fetchData = useCallback(async () => {
		if (!url) return;

		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		setLoading(true);
		setError(null);

		try {
			const res = await fetch(url, {
				headers,
				signal: controller.signal,
			});

			if (!res.ok) {
				const body = await res.json().catch(() => null);
				throw new Error(body?.error || `Request failed (${res.status})`);
			}

			const json = await res.json();
			setData(json);
		} catch (err: unknown) {
			if (err instanceof DOMException && err.name === 'AbortError') return;
			setError(err instanceof Error ? err.message : 'Unknown error');
		} finally {
			setLoading(false);
		}
	}, [url, headers]);

	useEffect(() => {
		if (autoFetch && url) {
			fetchData();
		}

		return () => {
			abortRef.current?.abort();
		};
	}, [autoFetch, url, fetchData]);

	return { data, error, loading, refetch: fetchData };
}

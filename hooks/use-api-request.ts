'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiErrorResponse {
	error?: string;
	errors?: Record<string, string>;
}

interface UseApiRequestOptions<TData> {
	method?: HttpMethod;
	headers?: Record<string, string>;
	autoFetch?: boolean;
	onSuccess?: (data: TData) => void;
}

interface UseApiRequestResult<TData> {
	data: TData | null;
	error: string | null;
	fieldErrors: Record<string, string> | null;
	loading: boolean;
	execute: (body?: unknown) => Promise<TData | null>;
	reset: () => void;
}

export function useApiRequest<TData>(
	url: string | null,
	options: UseApiRequestOptions<TData> = {},
): UseApiRequestResult<TData> {
	const { method = 'GET', headers, autoFetch, onSuccess } = options;
	const shouldAutoFetch = autoFetch ?? (method === 'GET' && !!url);

	const [data, setData] = useState<TData | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
	const [loading, setLoading] = useState(shouldAutoFetch);
	const abortRef = useRef<AbortController | null>(null);
	const onSuccessRef = useRef(onSuccess);
	onSuccessRef.current = onSuccess;

	const reset = useCallback(() => {
		setError(null);
		setFieldErrors(null);
	}, []);

	const execute = useCallback(
		async (body?: unknown): Promise<TData | null> => {
			if (!url) return null;

			abortRef.current?.abort();
			const controller = new AbortController();
			abortRef.current = controller;

			setLoading(true);
			setError(null);
			setFieldErrors(null);

			try {
				const res = await fetch(url, {
					method,
					headers: {
						...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
						...headers,
					},
					body: body !== undefined ? JSON.stringify(body) : undefined,
					signal: controller.signal,
				});

				if (!res.ok) {
					const apiError: ApiErrorResponse | null = await res.json().catch(() => null);
					const errorMessage = apiError?.error || `Request failed (${res.status})`;
					setError(errorMessage);
					if (apiError?.errors && Object.keys(apiError.errors).length > 0) {
						setFieldErrors(apiError.errors);
					}
					return null;
				}

				if (res.status === 204) {
					onSuccessRef.current?.(null as TData);
					return null as TData;
				}

				const json: TData = await res.json();
				setData(json);
				onSuccessRef.current?.(json);
				return json;
			} catch (err: unknown) {
				if (err instanceof DOMException && err.name === 'AbortError') return null;
				const message = err instanceof Error ? err.message : 'Unknown error';
				setError(message);
				return null;
			} finally {
				setLoading(false);
			}
		},
		[url, method, headers],
	);

	useEffect(() => {
		if (shouldAutoFetch && url) {
			execute();
		}
		return () => {
			abortRef.current?.abort();
		};
	}, [shouldAutoFetch, url, execute]);

	return { data, error, fieldErrors, loading, execute, reset };
}

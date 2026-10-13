import { onSessionExpired } from '@/lib/session-expired';

/**
 * Default SWR fetcher for the template's own /api/* routes. Throws on non-2xx
 * so SWR surfaces the error state.
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
	const res = await fetch(url);
	if (!res.ok) {
		if (res.status === 401 && url.startsWith('/api/account')) onSessionExpired();
		const body = await res.json().catch(() => null);
		throw new Error(body?.error || `Request failed: ${res.status}`);
	}
	return res.json() as Promise<T>;
}

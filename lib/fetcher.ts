/**
 * Default SWR fetcher for the template's own /api/* routes. Throws on non-2xx
 * so SWR surfaces the error state.
 */
export async function fetcher<T = unknown>(url: string): Promise<T> {
	const res = await fetch(url);
	if (!res.ok) {
		const body = await res.json().catch(() => null);
		throw new Error(body?.error || `Request failed: ${res.status}`);
	}
	return res.json() as Promise<T>;
}

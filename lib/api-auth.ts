import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { ACCESS_TOKEN_HEADER } from '@/lib/session-header';

/**
 * The signed-in customer's access token, as refreshed by the middleware for this request
 * (see lib/session-header.ts). Null when signed out or the session has expired.
 */
export async function getAccessToken(): Promise<string | null> {
	return (await headers()).get(ACCESS_TOKEN_HEADER) || null;
}

/**
 * Returns auth headers for SDK calls, or a 401 NextResponse if not authenticated.
 */
export async function requireAuth(): Promise<
	| { headers: { Authorization: string }; error?: never }
	| { headers?: never; error: NextResponse }
> {
	const token = await getAccessToken();
	if (!token) {
		return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) };
	}
	return { headers: { Authorization: `Bearer ${token}` } };
}

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Get the access token from the current session.
 * Returns null if not authenticated.
 */
export async function getAccessToken(): Promise<string | null> {
	const session = await auth();
	return session?.accessToken ?? null;
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

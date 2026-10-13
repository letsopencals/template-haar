import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ACCESS_TOKEN_HEADER } from '@/lib/session-header';

/**
 * 1. Session: this is where the customer's access token gets refreshed and written back to
 *    the session cookie (lib/auth.ts), and handed to API routes (lib/session-header.ts).
 * 2. Account pages need a live session (not just a cookie); auth pages bounce signed-in users.
 */

/** NextAuth's own endpoints (session, csrf, signin, signout, callback...) refresh and set the cookie themselves. */
const NEXTAUTH_ROUTES = /^\/api\/auth\/(session|csrf|providers|signin|signout|callback|error|verify-request)(\/|$)/;

const withSession = auth((req) => {
	const { pathname, search } = req.nextUrl;
	const accessToken = req.auth?.accessToken;

	// Protect account pages - redirect to sign-in (and back) without a live session
	if (pathname.startsWith('/account') && !accessToken) {
		const signIn = new URL('/auth/sign-in', req.url);
		signIn.searchParams.set('callbackUrl', pathname + search);
		return NextResponse.redirect(signIn);
	}

	// Redirect authenticated users away from auth pages
	if (pathname.startsWith('/auth') && !pathname.startsWith('/auth/verify-email') && accessToken) {
		return NextResponse.redirect(new URL('/account', req.url));
	}

	// Only we set this header: drop whatever the browser sent, then pass the fresh token on.
	const headers = new Headers(req.headers);
	headers.delete(ACCESS_TOKEN_HEADER);
	if (accessToken && pathname.startsWith('/api/')) headers.set(ACCESS_TOKEN_HEADER, accessToken);
	return NextResponse.next({ request: { headers } });
});

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
	if (NEXTAUTH_ROUTES.test(req.nextUrl.pathname)) return NextResponse.next();
	return withSession(req, ev as never);
}

export const config = {
	matcher: ['/account/:path*', '/auth/:path*', '/api/:path*'],
};

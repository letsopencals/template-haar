import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
	const { pathname } = req.nextUrl;
	const isAuthenticated = !!req.auth;

	// Protect account pages - redirect to sign-in if not authenticated
	if (pathname.startsWith('/account')) {
		if (!isAuthenticated) {
			return NextResponse.redirect(new URL('/auth/sign-in', req.url));
		}
	}

	// Redirect authenticated users away from auth pages
	if (pathname.startsWith('/auth') && !pathname.startsWith('/auth/verify-email')) {
		if (isAuthenticated) {
			return NextResponse.redirect(new URL('/account', req.url));
		}
	}

	return NextResponse.next();
});

export const config = {
	matcher: ['/account/:path*', '/auth/:path*'],
};

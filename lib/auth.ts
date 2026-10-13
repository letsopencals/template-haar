import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import type { SelfServiceProfileResponse as Customer } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { AuthService, SelfService } from '@opencals/storefront-sdk';

declare module 'next-auth' {
	interface Session {
		accessToken?: string;
		error?: 'RefreshTokenError';
		customer?: {
			id: string;
			email?: string;
			firstName?: string;
			lastName?: string;
		};
	}

	interface User {
		accessToken: string;
		refreshToken: string;
		customer?: {
			id: string;
			email?: string;
			firstName?: string;
			lastName?: string;
		};
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		accessToken?: string;
		refreshToken?: string;
		accessTokenExpires?: number;
		/** Set when the refresh token was rejected: the session is over, sign in again */
		error?: 'RefreshTokenError';
		customer?: {
			id: string;
			email?: string;
			firstName?: string;
			lastName?: string;
		};
	}
}

/** Refresh this long before the access token's own expiry, so a request never carries a dead one. */
const REFRESH_MARGIN_MS = 60 * 1000;

/**
 * When an access token expires, read from its `exp` claim. Customer tokens live 15 minutes (backend
 * default); the fallback only covers a token we can't decode.
 */
function tokenExpiry(accessToken: string | undefined): number {
	try {
		const part = (accessToken ?? '').split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/') ?? '';
		const { exp } = JSON.parse(atob(part.padEnd(part.length + ((4 - (part.length % 4)) % 4), '='))) as { exp?: number };
		if (typeof exp === 'number') return exp * 1000;
	} catch {
		// fall through
	}
	return Date.now() + 14 * 60 * 1000;
}

/**
 * Swap the refresh token for a new pair. The backend rotates refresh tokens (each one works
 * once), so the result must be persisted: that happens in the middleware, which runs first on
 * every request and writes the session cookie (see middleware.ts). If the refresh is rejected
 * and the old access token is still alive (a parallel request already rotated it), keep the old
 * token; otherwise the session is over and the customer is dropped, so the app signs them out.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
	try {
		if (!token.refreshToken) throw new Error('No refresh token');
		const { data } = await AuthService.refresh({
			headers: { Authorization: `Bearer ${token.refreshToken}` },
			throwOnError: true,
		});
		if (!data?.accessToken) throw new Error('Empty refresh response');

		return {
			...token,
			accessToken: data.accessToken,
			refreshToken: data.refreshToken ?? token.refreshToken,
			accessTokenExpires: tokenExpiry(data.accessToken),
			error: undefined,
		};
	} catch {
		if (token.accessToken && Date.now() < tokenExpiry(token.accessToken)) return token;
		return { ...token, accessToken: undefined, refreshToken: undefined, accessTokenExpires: undefined, customer: undefined, error: 'RefreshTokenError' };
	}
}

function mapCustomer(customer: Customer | undefined) {
	if (!customer) return undefined;
	return {
		id: customer.id,
		email: customer.email ?? undefined,
		firstName: customer.firstName ?? undefined,
		lastName: customer.lastName ?? undefined,
	};
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	pages: {
		signIn: '/auth/sign-in',
	},
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60,
	},
	providers: [
		// Email/password sign-in
		Credentials({
			id: 'credentials',
			credentials: {
				email: {},
				password: {},
			},
			async authorize(credentials) {
				const { email, password } = credentials as { email: string; password: string };

				try {
					const { data } = await AuthService.signIn({ body: { email, password } });
					const { accessToken, refreshToken } = data!;

					// Fetch customer profile
					const { data: customer } = await SelfService.getProfile({
						headers: { Authorization: `Bearer ${accessToken}` },
					});

					return {
						id: customer?.id ?? email,
						email,
						accessToken,
						refreshToken,
						customer: mapCustomer(customer),
					};
				} catch {
					return null;
				}
			},
		}),
		// Auto-auth after checkout (receives tokens directly)
		Credentials({
			id: 'checkout-token',
			// The tokens are verified against the API and the session is built from the profile they
			// belong to, never from client-sent customer fields (the callback endpoint is public).
			credentials: { accessToken: {}, refreshToken: {} },
			async authorize(credentials) {
				const { accessToken, refreshToken } = credentials as { accessToken?: string; refreshToken?: string };
				if (!accessToken || typeof accessToken !== 'string') return null;

				try {
					const { data: customer } = await SelfService.getProfile({
						headers: { Authorization: `Bearer ${accessToken}` },
						throwOnError: true,
					});
					if (!customer?.id) return null;

					return {
						id: customer.id,
						email: customer.email ?? undefined,
						accessToken,
						refreshToken: typeof refreshToken === 'string' ? refreshToken : '',
						customer: mapCustomer(customer),
					};
				} catch {
					return null;
				}
			},
		}),
		// Email verification token exchange
		Credentials({
			id: 'verify-token',
			credentials: { token: {} },
			async authorize(credentials) {
				const { token } = credentials as { token: string };

				try {
					const { data } = await AuthService.verifyEmail({ body: { token } });
					const { accessToken, refreshToken } = data!;

					const { data: customer } = await SelfService.getProfile({
						headers: { Authorization: `Bearer ${accessToken}` },
					});

					return {
						id: customer?.id ?? 'verified-customer',
						email: customer?.email ?? undefined,
						accessToken,
						refreshToken,
						customer: mapCustomer(customer),
					};
				} catch {
					return null;
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			// Initial sign-in
			if (user) {
				return {
					...token,
					accessToken: user.accessToken,
					refreshToken: user.refreshToken,
					accessTokenExpires: tokenExpiry(user.accessToken),
					customer: user.customer,
					error: undefined,
				};
			}

			// Session already over: nothing to refresh with
			if (token.error) return token;

			// Token still valid
			if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - REFRESH_MARGIN_MS) {
				return token;
			}

			return refreshAccessToken(token);
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			// No access token means signed out, even though the cookie still exists
			session.customer = token.accessToken ? token.customer : undefined;
			session.error = token.error;
			return session;
		},
	},
});

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import type { Customer } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { AuthService, SelfService } from '@opencals/storefront-sdk';

declare module 'next-auth' {
	interface Session {
		accessToken?: string;
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
		customer?: {
			id: string;
			email?: string;
			firstName?: string;
			lastName?: string;
		};
	}
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
	try {
		const { data } = await AuthService.refresh({
			headers: { Authorization: `Bearer ${token.refreshToken}` },
		});

		return {
			...token,
			accessToken: data?.accessToken,
			refreshToken: data?.refreshToken ?? token.refreshToken,
			accessTokenExpires: Date.now() + 25 * 60 * 1000,
		};
	} catch {
		return { ...token, accessToken: undefined, refreshToken: undefined };
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
			credentials: {
				accessToken: {},
				refreshToken: {},
				customerId: {},
				customerEmail: {},
				customerFirstName: {},
				customerLastName: {},
			},
			async authorize(credentials) {
				const { accessToken, refreshToken, customerId, customerEmail, customerFirstName, customerLastName } =
					credentials as Record<string, string>;

				if (!accessToken) return null;

				return {
					id: customerId ?? 'checkout-customer',
					email: customerEmail,
					accessToken,
					refreshToken: refreshToken ?? '',
					customer: {
						id: customerId ?? '',
						email: customerEmail,
						firstName: customerFirstName,
						lastName: customerLastName,
					},
				};
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
					accessTokenExpires: Date.now() + 25 * 60 * 1000,
					customer: user.customer,
				};
			}

			// Token still valid
			if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
				return token;
			}

			// Refresh
			return refreshAccessToken(token);
		},
		async session({ session, token }) {
			session.accessToken = token.accessToken;
			session.customer = token.customer;
			return session;
		},
	},
});

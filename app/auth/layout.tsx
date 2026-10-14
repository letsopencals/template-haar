import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Sign In',
	robots: { index: false, follow: false },
};

// Each auth page renders its own <AuthShell> (title/intro differ per page).
export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return children;
}

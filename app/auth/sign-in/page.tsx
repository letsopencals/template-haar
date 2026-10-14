import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SignInFlow } from '@/components/auth/sign-in-flow';
import { AuthFallback } from '@/components/auth/auth-feedback';

export const metadata: Metadata = { title: 'Sign in' };

export default function SignInPage() {
	return (
		<Suspense fallback={<AuthFallback />}>
			<SignInFlow />
		</Suspense>
	);
}

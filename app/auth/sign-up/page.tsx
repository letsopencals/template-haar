import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/sign-up-form';
import { AuthFallback } from '@/components/auth/auth-feedback';

export const metadata: Metadata = { title: 'Create an account' };

export default function Page() {
	return (
		<Suspense fallback={<AuthFallback />}>
			<SignUpForm />
		</Suspense>
	);
}

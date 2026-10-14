import { Suspense } from 'react';
import type { Metadata } from 'next';
import { VerifyEmailView } from '@/components/auth/verify-email-view';
import { AuthFallback } from '@/components/auth/auth-feedback';

export const metadata: Metadata = { title: 'Verify your email' };

export default function Page() {
	return (
		<Suspense fallback={<AuthFallback />}>
			<VerifyEmailView />
		</Suspense>
	);
}

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { AuthFallback } from '@/components/auth/auth-feedback';

export const metadata: Metadata = { title: 'Forgot password' };

export default function Page() {
	return (
		<Suspense fallback={<AuthFallback />}>
			<ForgotPasswordForm />
		</Suspense>
	);
}

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { AuthFallback } from '@/components/auth/auth-feedback';

export const metadata: Metadata = { title: 'Reset password' };

export default function Page() {
	return (
		<Suspense fallback={<AuthFallback />}>
			<ResetPasswordForm />
		</Suspense>
	);
}

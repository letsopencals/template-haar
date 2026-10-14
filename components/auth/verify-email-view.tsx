'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { Seal } from '@/components/motifs/seal';
import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { Notice, Spinner, TEXT_LINK } from '@/components/auth/auth-feedback';

type Status = 'pending' | 'verifying' | 'success' | 'error';

export function VerifyEmailView() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const email = searchParams.get('email');

	const [status, setStatus] = useState<Status>(token ? 'verifying' : 'pending');
	const [error, setError] = useState<string | null>(null);
	const [resending, setResending] = useState(false);
	const [resent, setResent] = useState(false);

	// Auto-verify when the emailed link carries a token.
	useEffect(() => {
		if (!token) return;
		let redirectTimer: ReturnType<typeof setTimeout> | undefined;

		(async () => {
			try {
				const result = await signIn('verify-token', { token, redirect: false });
				if (result?.error) {
					setStatus('error');
					setError('Verification failed. The link may have expired.');
				} else {
					setStatus('success');
					redirectTimer = setTimeout(() => {
						router.push('/account');
						router.refresh();
					}, 2000);
				}
			} catch {
				setStatus('error');
				setError('Something went wrong. Please try again.');
			}
		})();

		return () => clearTimeout(redirectTimer);
	}, [token, router]);

	const handleResend = async () => {
		if (!email || resending) return;
		setResending(true);
		try {
			await fetch('/api/auth/sign-up', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password: '' }), // Won't create a new account, just resends
			});
		} finally {
			setResent(true);
			setResending(false);
		}
	};

	const footer = (
		<>
			<AuthLink href="/auth/sign-in">Back to sign in</AuthLink>
		</>
	);

	if (status === 'verifying') {
		return (
			<AuthShell eyebrow="Nº 00 — Verify" title={<>One <em>moment</em>.</>} intro="Checking your link…">
				<div className="flex items-center gap-4 text-sm text-warm-gray" role="status">
					<Spinner />
					Verifying your email…
				</div>
			</AuthShell>
		);
	}

	if (status === 'success') {
		return (
			<AuthShell
				eyebrow="Nº 00 — Verify"
				title={<>You&apos;re <em>in</em>.</>}
				intro="Your email is verified. Taking you to your salon diary…"
			>
				<Seal ring="Verified · Welcome to HAAR · " center="✓" size={128} motion="stamp" />
			</AuthShell>
		);
	}

	if (status === 'error') {
		return (
			<AuthShell eyebrow="Nº 00 — Verify" title={<>Link <em>expired</em>.</>} footer={footer}>
				<Notice className="mb-6">{error}</Notice>
				<Link href="/auth/sign-in" className={buttonClasses({ size: 'lg', fullWidth: true })}>
					Sign in
				</Link>
			</AuthShell>
		);
	}

	return (
		<AuthShell
			eyebrow="Nº 00 — Verify"
			title={<>Check your <em>inbox</em>.</>}
			intro={
				<>
					We&apos;ve sent a verification link to{' '}
					{email ? <span className="font-medium text-charcoal">{email}</span> : 'your email'}. Open it to finish
					setting up your account.
				</>
			}
			footer={footer}
		>
			<div className="border-y border-line py-6">
				<p className="eyebrow text-brass">While you wait</p>
				<p className="mt-2 text-sm leading-relaxed text-warm-gray">
					It can take a minute to arrive. Check your spam folder if it doesn&apos;t appear.
				</p>
			</div>
			{email ? (
				<button type="button" onClick={handleResend} disabled={resending || resent} className={`${TEXT_LINK} mt-6`}>
					{resent ? 'Email resent' : resending ? 'Resending…' : 'Resend verification email'}
				</button>
			) : null}
		</AuthShell>
	);
}

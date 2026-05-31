'use client';

import { Suspense, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" /></div>}>
			<VerifyEmailContent />
		</Suspense>
	);
}

function VerifyEmailContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const email = searchParams.get('email');

	const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>(
		token ? 'verifying' : 'pending',
	);
	const [error, setError] = useState<string | null>(null);

	// Auto-verify if token is present
	useEffect(() => {
		if (!token) return;

		async function verify() {
			try {
				const result = await signIn('verify-token', {
					token,
					redirect: false,
				});

				if (result?.error) {
					setStatus('error');
					setError('Verification failed. The link may have expired.');
				} else {
					setStatus('success');
					setTimeout(() => {
						router.push('/account');
						router.refresh();
					}, 2000);
				}
			} catch {
				setStatus('error');
				setError('Something went wrong. Please try again.');
			}
		}

		verify();
	}, [token, router]);

	// Resend verification
	const [resending, setResending] = useState(false);
	const [resent, setResent] = useState(false);

	const handleResend = async () => {
		if (!email || resending) return;
		setResending(true);

		try {
			await fetch('/api/auth/sign-up', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password: '' }), // This won't create a new account, just resend
			});
		} finally {
			setResent(true);
			setResending(false);
		}
	};

	return (
		<section className="flex min-h-screen items-center justify-center bg-white px-6 pt-20 pb-20">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-[440px] text-center"
			>
				<Link href="/" className="font-display text-2xl font-bold tracking-tight text-charcoal">
					{siteConfig.logo.text}<span className="text-accent">{siteConfig.logo.accent}</span>
				</Link>

				{status === 'verifying' && (
					<div className="mt-8">
						<div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-charcoal border-t-transparent" />
						<p className="mt-4 text-sm text-warm-gray">Verifying your email...</p>
					</div>
				)}

				{status === 'success' && (
					<div className="mt-8">
						<div className="mx-auto flex h-16 w-16 items-center justify-center bg-green-100">
							<svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h1 className="mt-6 font-display text-3xl font-semibold text-charcoal">Email Verified</h1>
						<p className="mt-2 text-sm text-warm-gray">
							Your email has been verified. Redirecting to your account...
						</p>
					</div>
				)}

				{status === 'error' && (
					<div className="mt-8">
						<div className="mx-auto flex h-16 w-16 items-center justify-center bg-red-100">
							<svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</div>
						<h1 className="mt-6 font-display text-3xl font-semibold text-charcoal">Verification Failed</h1>
						<p className="mt-2 text-sm text-warm-gray">{error}</p>
						<Link
							href="/auth/sign-in"
							className="mt-6 inline-block bg-charcoal px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent"
						>
							Sign In
						</Link>
					</div>
				)}

				{status === 'pending' && (
					<div className="mt-8">
						<div className="mx-auto flex h-16 w-16 items-center justify-center bg-accent/10">
							<svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
							</svg>
						</div>
						<h1 className="mt-6 font-display text-3xl font-semibold text-charcoal">Check Your Email</h1>
						<p className="mt-2 text-sm text-warm-gray">
							We&apos;ve sent a verification link to{' '}
							{email ? <span className="font-medium text-charcoal">{email}</span> : 'your email'}.
							<br />
							Click the link in the email to verify your account.
						</p>

						{email && (
							<button
								onClick={handleResend}
								disabled={resending || resent}
								className="mt-6 text-xs font-medium text-warm-gray underline hover:text-accent disabled:opacity-50"
							>
								{resent ? 'Email resent' : resending ? 'Resending...' : 'Resend verification email'}
							</button>
						)}
					</div>
				)}

				<p className="mt-8 text-sm text-warm-gray">
					<Link href="/auth/sign-in" className="font-medium text-charcoal hover:text-accent">
						Back to sign in
					</Link>
				</p>
			</motion.div>
		</section>
	);
}

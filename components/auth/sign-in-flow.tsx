'use client';

import { useCallback, useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { CODE_LENGTH, CodeInput } from '@/components/auth/code-input';
import { FIELD_LABEL, Notice, TEXT_LINK } from '@/components/auth/auth-feedback';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';
import { siteConfig } from '@/lib/site-config';

const emailSchema = z.string().trim().min(1, 'Email is required').email('Please enter a valid email');

const RESEND_COOLDOWN_S = 30;

type Step = 'email' | 'choose' | 'code' | 'password';

const INTRO: Record<Step, string> = {
	email: 'Sign in to see your next visit, move a booking, or find a receipt.',
	choose: 'How would you like to come in?',
	code: 'Enter the six digits we just emailed you.',
	password: 'Enter your password to continue.',
};

const STEP_INITIAL = { opacity: 0, x: 18 } as const;
const STEP_ANIMATE = { opacity: 1, x: 0 } as const;
const STEP_EXIT = { opacity: 0, x: -18 } as const;
const FADE = { opacity: 0 } as const;
const STEP_TRANSITION = { duration: DURATION.fast, ease: EASE_OUT } as const;

/** Only allow same-origin relative paths as a post-sign-in destination. */
function safeCallback(raw: string | null): string {
	if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/account';
	return raw;
}

/**
 * Email first, then a choice: a 6-digit code by email (primary) or the
 * password. Both land on `callbackUrl` (set by the middleware or
 * `onSessionExpired`).
 */
export function SignInFlow() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = safeCallback(searchParams.get('callbackUrl'));
	const reduce = useReducedMotion();

	const [step, setStep] = useState<Step>('email');
	const [email, setEmail] = useState(searchParams.get('email') ?? '');
	const [code, setCode] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [cooldown, setCooldown] = useState(0);

	useEffect(() => {
		if (cooldown <= 0) return;
		const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => clearTimeout(id);
	}, [cooldown]);

	const finish = useCallback(() => {
		router.push(callbackUrl);
		router.refresh();
	}, [router, callbackUrl]);

	const go = (next: Step) => {
		setError(null);
		setInfo(null);
		setStep(next);
	};

	const submitEmail = () => {
		const parsed = emailSchema.safeParse(email);
		if (!parsed.success) {
			setError(parsed.error.issues[0]?.message ?? 'Please enter a valid email');
			return;
		}
		setEmail(parsed.data);
		go('choose');
	};

	const sendCode = async (isResend = false) => {
		setError(null);
		setLoading(true);
		try {
			// Always 204 (no account enumeration), so there is nothing to branch on.
			await fetch('/api/auth/request-login-code', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});
			setCooldown(RESEND_COOLDOWN_S);
			setCode('');
			setStep('code');
			setInfo(isResend ? 'A fresh code is on its way.' : null);
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const verifyCode = async (value = code) => {
		setError(null);
		setInfo(null);
		if (value.length < CODE_LENGTH) {
			setError('Enter all six digits from your email.');
			return;
		}
		setLoading(true);
		try {
			const result = await signIn('login-code', { email, code: value, redirect: false });
			if (result?.error) {
				setError('That code is invalid or has expired. Check the latest email, or send a new one.');
				setCode('');
			} else {
				finish();
			}
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const signInWithPassword = async () => {
		setError(null);
		if (password.length < 6) {
			setError('Password must be at least 6 characters.');
			return;
		}
		setLoading(true);
		try {
			const result = await signIn('credentials', { email, password, redirect: false });
			if (result?.error) setError('That email and password don’t match our book.');
			else finish();
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const changeEmail = () => {
		setCode('');
		setPassword('');
		go('email');
	};

	return (
		<AuthShell
			eyebrow="Nº 00 — Members"
			title={
				<>
					Welcome <em>back</em>.
				</>
			}
			intro={INTRO[step]}
			footer={
				<>
					New to {siteConfig.name}? <AuthLink href="/auth/sign-up">Create an account</AuthLink>
				</>
			}
		>
			{error ? <Notice className="mb-6">{error}</Notice> : null}
			{info && !error ? (
				<Notice tone="success" className="mb-6">
					{info}
				</Notice>
			) : null}

			<AnimatePresence mode="wait" initial={false}>
				<motion.div
					key={step}
					initial={reduce ? FADE : STEP_INITIAL}
					animate={STEP_ANIMATE}
					exit={reduce ? FADE : STEP_EXIT}
					transition={STEP_TRANSITION}
				>
					{step === 'email' ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								submitEmail();
							}}
							className="space-y-6"
							noValidate
						>
							<div>
								<label htmlFor="signin-email" className={FIELD_LABEL}>
									Email
								</label>
								<Input
									id="signin-email"
									type="email"
									autoComplete="email"
									autoFocus
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="you@example.com"
								/>
							</div>
							<Button type="submit" size="lg" fullWidth>
								Continue
							</Button>
						</form>
					) : null}

					{step === 'choose' ? (
						<div className="space-y-4">
							<EmailChip email={email} onChange={changeEmail} />
							<button
								type="button"
								onClick={() => sendCode(false)}
								disabled={loading}
								className="group flex w-full items-center gap-5 border border-charcoal bg-charcoal px-6 py-5 text-left text-white transition-colors duration-500 hover:border-accent hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
							>
								<span className="tabular text-xs text-brass-light group-hover:text-white">01</span>
								<span className="flex-1">
									<span className="block font-display text-xl italic">
										{loading ? 'Sending your code…' : 'Email me a code'}
									</span>
									<span className="mt-1 block text-xs text-white/60 group-hover:text-white/80">
										Six digits, no password to remember. Recommended.
									</span>
								</span>
								<span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
									→
								</span>
							</button>
							<button
								type="button"
								onClick={() => go('password')}
								disabled={loading}
								className="group flex w-full items-center gap-5 border border-charcoal/20 px-6 py-5 text-left text-charcoal transition-colors duration-500 hover:border-charcoal hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
							>
								<span className="tabular text-xs text-brass">02</span>
								<span className="flex-1">
									<span className="block font-display text-xl">Use my password</span>
									<span className="mt-1 block text-xs text-warm-gray">If you set one when you joined.</span>
								</span>
								<span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
									→
								</span>
							</button>
						</div>
					) : null}

					{step === 'code' ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								void verifyCode();
							}}
							className="space-y-6"
						>
							<EmailChip email={email} onChange={changeEmail} />
							<CodeInput
								value={code}
								onChange={setCode}
								onComplete={(c) => void verifyCode(c)}
								disabled={loading}
								invalid={!!error}
								autoFocus
							/>
							<Button type="submit" size="lg" fullWidth disabled={loading || code.length < CODE_LENGTH}>
								{loading ? 'Checking…' : 'Sign in'}
							</Button>
							<div className="flex flex-col gap-2">
								<button type="button" onClick={() => sendCode(true)} disabled={cooldown > 0 || loading} className={TEXT_LINK}>
									{cooldown > 0 ? (
										<>
											Resend code in <span className="tabular">{cooldown}s</span>
										</>
									) : (
										'Send a new code'
									)}
								</button>
								<button type="button" onClick={() => go('password')} className={TEXT_LINK}>
									Use my password instead
								</button>
							</div>
						</form>
					) : null}

					{step === 'password' ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								void signInWithPassword();
							}}
							className="space-y-6"
						>
							<EmailChip email={email} onChange={changeEmail} />
							{/* Hidden username field so password managers pair the right account. */}
							<input type="email" name="email" autoComplete="username" value={email} readOnly hidden />
							<div>
								<div className="mb-2.5 flex items-baseline justify-between">
									<label htmlFor="signin-password" className="eyebrow text-warm-gray">
										Password
									</label>
									<Link href="/auth/forgot-password" className="eyebrow text-warm-gray transition-colors hover:text-accent">
										Forgot?
									</Link>
								</div>
								<Input
									id="signin-password"
									type="password"
									autoComplete="current-password"
									autoFocus
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Your password"
								/>
							</div>
							<Button type="submit" size="lg" fullWidth disabled={loading}>
								{loading ? 'Signing in…' : 'Sign in'}
							</Button>
							<button type="button" onClick={() => sendCode(false)} disabled={loading} className={TEXT_LINK}>
								Email me a code instead
							</button>
						</form>
					) : null}
				</motion.div>
			</AnimatePresence>
		</AuthShell>
	);
}

/** The email being signed in, with a quiet "change" control. */
function EmailChip({ email, onChange }: { email: string; onChange: () => void }) {
	return (
		<div className="flex items-center justify-between gap-4 border-y border-line py-3">
			<div className="min-w-0">
				<p className="eyebrow text-warm-gray">Signing in as</p>
				<p className="mt-1 truncate text-sm font-medium text-charcoal">{email}</p>
			</div>
			<button
				type="button"
				onClick={onChange}
				className="eyebrow link-underline shrink-0 text-charcoal transition-colors hover:text-accent"
			>
				Change
			</button>
		</div>
	);
}

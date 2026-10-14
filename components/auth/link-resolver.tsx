'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resolveLink, type ResolveLinkResult } from '@/app/auth/actions/resolve-link';
import { buttonClasses } from '@/components/ui/button';
import { AuthLink, AuthShell } from '@/components/auth/auth-shell';
import { Notice, Spinner } from '@/components/auth/auth-feedback';

type ErrorCode = NonNullable<ResolveLinkResult['errorCode']>;

const ERROR_COPY: Record<ErrorCode, { word: string; lead: string; message: string }> = {
	TOKEN_EXPIRED: {
		word: 'expired',
		lead: 'This link has',
		message: 'Links from our emails only last a little while. Sign in with a fresh code instead.',
	},
	TOKEN_USED: {
		word: 'used',
		lead: 'Already',
		message: 'This link has already been opened once. Sign in with a fresh code to carry on.',
	},
	TOKEN_INVALID: {
		word: 'link',
		lead: 'An unknown',
		message: 'We couldn’t find this link. It may have been copied incompletely.',
	},
};

/**
 * The backend emits `/account/appointments/{id}/view(?action=...)`, but this
 * template's detail route is `/account/appointments/{id}`. Strip the trailing
 * `/view` while keeping the query string (e.g. `?action=cancel`).
 */
function normalizeRedirect(path: string): string {
	return path.replace(/^(\/account\/appointments\/[^/]+)\/view/, '$1');
}

export function LinkResolver({ token }: { token: string }) {
	const router = useRouter();
	const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
	const ranRef = useRef(false);

	useEffect(() => {
		if (!token || ranRef.current) return;
		ranRef.current = true;

		(async () => {
			const result = await resolveLink(token);
			if (result.success) {
				router.replace(normalizeRedirect(result.redirectPath || '/account'));
				router.refresh();
			} else {
				setErrorCode(result.errorCode ?? 'TOKEN_INVALID');
			}
		})();
	}, [token, router]);

	if (!errorCode) {
		return (
			<AuthShell eyebrow="Nº 00 — Letters" title={<>Opening your <em>diary</em>.</>} intro="One moment while we sign you in.">
				<div className="flex items-center gap-4 text-sm text-warm-gray" role="status">
					<Spinner />
					Signing you in…
				</div>
			</AuthShell>
		);
	}

	const copy = ERROR_COPY[errorCode];
	return (
		<AuthShell
			eyebrow="Nº 00 — Letters"
			title={
				<>
					{copy.lead} <em>{copy.word}</em>.
				</>
			}
			footer={
				<>
					New here? <AuthLink href="/auth/sign-up">Create an account</AuthLink>
				</>
			}
		>
			<Notice className="mb-8">{copy.message}</Notice>
			<Link href="/auth/sign-in" className={buttonClasses({ size: 'lg', fullWidth: true })}>
				Send me a new code
			</Link>
		</AuthShell>
	);
}

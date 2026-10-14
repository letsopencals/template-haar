import { clsx } from 'clsx';

/** Hairline message strip for auth and account forms. */
export function Notice({
	tone = 'error',
	children,
	className,
}: {
	tone?: 'error' | 'success' | 'info';
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			role={tone === 'error' ? 'alert' : 'status'}
			className={clsx(
				'flex items-start gap-3 border px-4 py-3 text-sm leading-relaxed',
				tone === 'error' && 'border-red-200 bg-red-50/70 text-red-800',
				tone === 'success' && 'border-brass/50 bg-cream text-charcoal',
				tone === 'info' && 'border-line-strong bg-paper text-warm-gray',
				className,
			)}
		>
			<span
				aria-hidden
				className={clsx(
					'mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full',
					tone === 'error' && 'bg-red-500',
					tone === 'success' && 'bg-brass',
					tone === 'info' && 'bg-warm-gray-light',
				)}
			/>
			<div>{children}</div>
		</div>
	);
}

/** Thin brass ring spinner. */
export function Spinner({ className }: { className?: string }) {
	return (
		<span
			aria-hidden
			className={clsx('inline-block h-7 w-7 animate-spin rounded-full border border-line-strong border-t-brass', className)}
		/>
	);
}

/** Full-screen loading fallback for Suspense boundaries on auth pages. */
export function AuthFallback() {
	return (
		<div className="flex min-h-[100svh] items-center justify-center bg-paper">
			<Spinner />
		</div>
	);
}

/** Small-caps field label. */
export const FIELD_LABEL = 'eyebrow mb-2.5 block text-warm-gray';
/** Pass to `FormLabel` so it matches `FIELD_LABEL` (overrides its default style). */
export const FORM_LABEL = 'eyebrow mb-1 block text-warm-gray';
/** Quiet text-button used under auth forms ("Use a different email"). */
export const TEXT_LINK =
	'eyebrow w-full py-1 text-center text-warm-gray transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40';

import { clsx } from 'clsx';

/** Section divider: a hairline with a small open-scissors glyph and a dashed "cut line" tail. */
export function ScissorRule({ className }: { className?: string }) {
	return (
		<div aria-hidden className={clsx('flex items-center gap-3 text-brass', className)}>
			<span className="h-px flex-1 bg-current opacity-40" />
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.2" className="-rotate-90">
				<circle cx="6" cy="6" r="3" />
				<circle cx="6" cy="18" r="3" />
				<path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12" />
			</svg>
			<span className="h-px flex-1 border-t border-dashed border-current opacity-40" />
		</div>
	);
}

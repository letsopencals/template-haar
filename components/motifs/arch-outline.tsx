import { clsx } from 'clsx';

/**
 * Hairline arch ornament (the mirror frame). Sits behind or beside arch images,
 * offset a few px, or alone as a section divider. Stretches to its box.
 */
export function ArchOutline({ className, strokeClassName = 'stroke-brass' }: { className?: string; strokeClassName?: string }) {
	return (
		<svg aria-hidden viewBox="0 0 100 150" preserveAspectRatio="none" className={clsx('pointer-events-none', className)}>
			<path d="M0.5 149.5V50a49.5 49.5 0 0 1 99 0v99.5" fill="none" vectorEffect="non-scaling-stroke" strokeWidth="1" className={strokeClassName} />
		</svg>
	);
}

import { clsx } from 'clsx';

export interface MarqueeProps {
	children: React.ReactNode;
	/** Seconds per loop. Default 40. */
	duration?: number;
	reverse?: boolean;
	pauseOnHover?: boolean;
	className?: string;
	/** Gap between repeats, as a Tailwind gap class. Default 'gap-16'. */
	gapClassName?: string;
}

/**
 * Infinite horizontal ticker (CSS-only, works as a Server Component). Children
 * are rendered twice and the track slides -50%. Reduced motion: the
 * `animate-marquee` loop is disabled in globals.css, so it sits still.
 */
export function Marquee({
	children,
	duration = 40,
	reverse,
	pauseOnHover = true,
	className,
	gapClassName = 'gap-16',
}: MarqueeProps) {
	return (
		<div className={clsx('group/marquee relative overflow-hidden', className)}>
			<div
				className={clsx(
					'flex w-max animate-marquee',
					gapClassName,
					pauseOnHover && 'group-hover/marquee:[animation-play-state:paused]',
				)}
				style={{ animationDuration: `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
			>
				<div className={clsx('flex shrink-0 items-center', gapClassName)}>{children}</div>
				<div aria-hidden className={clsx('flex shrink-0 items-center', gapClassName)}>
					{children}
				</div>
			</div>
		</div>
	);
}

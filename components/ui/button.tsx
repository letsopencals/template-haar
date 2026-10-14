import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'inverse' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
}

// Buttons are deliberately SQUARED (rounded-none) — the canonical shape for HAAR.
// The arch belongs to imagery; controls stay square. Don't reintroduce pills.
const BASE =
	'group/btn relative isolate inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-none font-semibold uppercase tracking-[0.22em] transition-colors duration-500 ease-[var(--ease-expo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-45';

// Hover fill sweeps in from the left (a pseudo-element behind the label).
const SWEEP =
	'before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:transition-transform before:duration-500 before:ease-[var(--ease-expo)] hover:before:scale-x-100';

const VARIANTS: Record<ButtonVariant, string> = {
	// Solid charcoal → accent sweep.
	primary: clsx('bg-charcoal text-white before:bg-accent', SWEEP),
	// Solid accent → charcoal sweep.
	accent: clsx('bg-accent text-white before:bg-charcoal', SWEEP),
	// Hairline charcoal → charcoal sweep with white label.
	outline: clsx('border border-charcoal/20 text-charcoal hover:text-white before:bg-charcoal', SWEEP),
	// For charcoal spreads: cream → accent sweep.
	inverse: clsx('bg-cream text-charcoal hover:text-white before:bg-accent', SWEEP),
	ghost: 'text-charcoal hover:text-accent',
};

const SIZES: Record<ButtonSize, string> = {
	sm: 'px-5 py-2.5 text-[0.65rem]',
	md: 'px-7 py-3.5 text-[0.68rem]',
	lg: 'px-9 py-[1.15rem] text-[0.7rem]',
};

/** Shared class string, so `next/link` CTAs can look like buttons. */
export function buttonClasses({
	variant = 'primary',
	size = 'md',
	fullWidth,
	className,
}: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; className?: string } = {}) {
	return clsx(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ variant = 'primary', size = 'md', fullWidth, className, type = 'button', ...props },
	ref,
) {
	return <button ref={ref} type={type} className={buttonClasses({ variant, size, fullWidth, className })} {...props} />;
});

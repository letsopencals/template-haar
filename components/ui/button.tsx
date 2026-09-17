import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
}

// Buttons are deliberately SQUARED (rounded-none) — the canonical shape for this
// minimalist salon template. Don't reintroduce rounded/pill buttons.
const BASE =
	'inline-flex items-center justify-center gap-2 rounded-none font-semibold uppercase tracking-[0.2em] transition-all disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
	// Solid charcoal → hovers to accent.
	primary: 'bg-charcoal text-white hover:bg-accent',
	// Bordered charcoal/10 → hovers to cream.
	outline: 'border border-charcoal/10 text-charcoal hover:bg-cream',
	ghost: 'text-charcoal hover:text-accent',
};

const SIZES: Record<ButtonSize, string> = {
	sm: 'px-5 py-2.5 text-xs',
	md: 'px-6 py-3.5 text-xs',
	lg: 'px-8 py-4 text-xs',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{ variant = 'primary', size = 'md', fullWidth, className, type = 'button', ...props },
	ref,
) {
	return (
		<button
			ref={ref}
			type={type}
			className={clsx(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)}
			{...props}
		/>
	);
});

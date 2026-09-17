import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

// Squared box field — the canonical text-field style (auth / checkout / account).
const FIELD_BASE =
	'w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-charcoal';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
	function Input({ className, ...props }, ref) {
		return <input ref={ref} className={clsx(FIELD_BASE, className)} {...props} />;
	},
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
	function Textarea({ className, ...props }, ref) {
		return <textarea ref={ref} className={clsx(FIELD_BASE, className)} {...props} />;
	},
);

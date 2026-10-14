import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

// Squared box field — the canonical text-field style (auth / checkout / account).
const FIELD_BASE =
	'w-full rounded-none border border-charcoal/15 bg-white/70 px-4 py-3.5 text-[0.95rem] text-charcoal outline-none transition-[border-color,background-color,box-shadow] duration-300 placeholder:text-warm-gray-light hover:border-charcoal/30 focus:border-charcoal focus:bg-white focus:shadow-[0_0_0_4px_rgba(232,83,14,0.08)] aria-[invalid=true]:border-red-400';

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

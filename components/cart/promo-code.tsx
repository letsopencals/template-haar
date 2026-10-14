'use client';

import { useId, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { useCart } from '@/contexts/cart-context';

/**
 * Compact promo-code group shared by the drawer and /checkout. Collapsed to a
 * single "Have a code?" line until opened; shows the applied code as a chip
 * with Remove once accepted.
 */
export function PromoCode({ className }: { className?: string }) {
	const { cart, applyDiscountCode, removeDiscountCode, discountCodeError, clearDiscountCodeError } = useCart();
	const [open, setOpen] = useState(false);
	const [code, setCode] = useState('');
	const [pending, setPending] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const inputId = useId();
	const errorId = useId();

	const applied = cart?.appliedDiscountCode ?? null;

	const handleApply = async (e: React.FormEvent) => {
		e.preventDefault();
		e.stopPropagation();
		const trimmed = code.trim();
		if (!trimmed) return;
		setPending(true);
		try {
			const ok = await applyDiscountCode(trimmed);
			if (ok) {
				setCode('');
				setOpen(false);
			}
		} finally {
			setPending(false);
		}
	};

	const handleToggle = () => {
		clearDiscountCodeError();
		setOpen((v) => !v);
		if (!open) setTimeout(() => inputRef.current?.focus(), 0);
	};

	const handleRemove = async () => {
		setPending(true);
		try {
			await removeDiscountCode();
		} finally {
			setPending(false);
		}
	};

	if (applied) {
		return (
			<div className={clsx('flex items-center justify-between gap-3', className)}>
				<span className="eyebrow text-warm-gray">Code</span>
				<span className="flex items-center gap-3">
					<span className="tabular border border-dashed border-brass px-2.5 py-1 text-xs uppercase text-charcoal">{applied}</span>
					<button
						type="button"
						onClick={handleRemove}
						disabled={pending}
						className="text-xs text-warm-gray underline-offset-4 hover:text-charcoal hover:underline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
					>
						Remove
					</button>
				</span>
			</div>
		);
	}

	return (
		<div className={className}>
			<button
				type="button"
				onClick={handleToggle}
				aria-expanded={open}
				className="group flex items-center gap-2 text-xs text-warm-gray transition-colors hover:text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
			>
				<span className={clsx('tabular inline-block transition-transform duration-300', open && 'rotate-45')} aria-hidden>
					+
				</span>
				<span className="link-underline">{open ? 'Hide the code field' : 'Have a gift card or promo code?'}</span>
			</button>
			{open ? (
				<form onSubmit={handleApply} className="mt-3 flex">
					<label htmlFor={inputId} className="sr-only">
						Promo code
					</label>
					<input
						id={inputId}
						ref={inputRef}
						type="text"
						value={code}
						autoComplete="off"
						spellCheck={false}
						onChange={(e) => {
							setCode(e.target.value);
							if (discountCodeError) clearDiscountCodeError();
						}}
						aria-invalid={discountCodeError ? true : undefined}
						aria-describedby={discountCodeError ? errorId : undefined}
						placeholder="Enter code"
						className="tabular min-w-0 flex-1 rounded-none border border-r-0 border-charcoal/20 bg-white/70 px-3 py-2.5 text-sm uppercase text-charcoal outline-none placeholder:normal-case placeholder:text-warm-gray-light focus:border-charcoal aria-[invalid=true]:border-red-400"
					/>
					<button
						type="submit"
						disabled={pending || !code.trim()}
						className="eyebrow rounded-none border border-charcoal bg-charcoal px-4 text-white transition-colors hover:border-accent hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-45"
					>
						{pending ? '…' : 'Apply'}
					</button>
				</form>
			) : null}
			{discountCodeError ? (
				<p id={errorId} role="alert" className="mt-2 text-xs text-red-700">
					{discountCodeError.message ?? 'This code is not valid.'}
				</p>
			) : null}
		</div>
	);
}

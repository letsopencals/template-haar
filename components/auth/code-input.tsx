'use client';

import { useRef } from 'react';
import { clsx } from 'clsx';

export const CODE_LENGTH = 6;

/**
 * Six squared boxes for the emailed login code. Typing advances, Backspace on
 * an empty box steps back, arrows move, and pasting (or iOS/Android one-time-
 * code autofill into the first box) spreads the whole code across the boxes.
 * `onComplete` fires once all six digits are present.
 */
export function CodeInput({
	value,
	onChange,
	onComplete,
	disabled,
	invalid,
	autoFocus,
}: {
	value: string;
	onChange: (code: string) => void;
	onComplete?: (code: string) => void;
	disabled?: boolean;
	invalid?: boolean;
	autoFocus?: boolean;
}) {
	const refs = useRef<Array<HTMLInputElement | null>>([]);
	const digits = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? '');

	const focusBox = (i: number) => {
		const el = refs.current[Math.max(0, Math.min(CODE_LENGTH - 1, i))];
		el?.focus();
		el?.select();
	};

	const commit = (next: string, focusIndex: number) => {
		const clean = next.replace(/\D/g, '').slice(0, CODE_LENGTH);
		onChange(clean);
		focusBox(focusIndex);
		if (clean.length === CODE_LENGTH) onComplete?.(clean);
	};

	const handleChange = (i: number, raw: string) => {
		const typed = raw.replace(/\D/g, '');
		if (!typed) return;
		// Several digits at once = paste or OS autofill: fill from this box onwards.
		if (typed.length > 1) {
			const merged = (value.slice(0, i) + typed).slice(0, CODE_LENGTH);
			commit(merged, merged.length);
			return;
		}
		const arr = digits.slice();
		arr[i] = typed;
		const next = arr.join('');
		commit(next, i + 1);
	};

	const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace') {
			e.preventDefault();
			const arr = digits.slice();
			if (arr[i]) {
				arr[i] = '';
				onChange(arr.join('').slice(0, CODE_LENGTH));
				return;
			}
			if (i > 0) {
				arr[i - 1] = '';
				onChange(arr.join(''));
				focusBox(i - 1);
			}
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			focusBox(i - 1);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			focusBox(i + 1);
		}
	};

	const handlePaste = (i: number, e: React.ClipboardEvent<HTMLInputElement>) => {
		const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
		if (!pasted) return;
		e.preventDefault();
		const merged = (value.slice(0, i) + pasted).slice(0, CODE_LENGTH);
		commit(merged, merged.length);
	};

	return (
		<div role="group" aria-label="6-digit login code" className="flex items-center justify-between gap-2 sm:gap-3">
			{digits.map((d, i) => (
				<input
					key={i}
					ref={(el) => {
						refs.current[i] = el;
					}}
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					autoComplete={i === 0 ? 'one-time-code' : 'off'}
					autoFocus={autoFocus && i === 0}
					// The first box accepts a full autofilled code; others take one digit.
					maxLength={i === 0 ? CODE_LENGTH : 1}
					value={d}
					disabled={disabled}
					aria-label={`Digit ${i + 1} of ${CODE_LENGTH}`}
					aria-invalid={invalid || undefined}
					onChange={(e) => handleChange(i, e.target.value)}
					onKeyDown={(e) => handleKeyDown(i, e)}
					onPaste={(e) => handlePaste(i, e)}
					onFocus={(e) => e.target.select()}
					className={clsx(
						'tabular h-16 w-full min-w-0 rounded-none border bg-white/70 text-center text-[1.6rem] text-charcoal outline-none transition-[border-color,box-shadow,background-color] duration-300 sm:h-[4.5rem]',
						'focus:border-charcoal focus:bg-white focus:shadow-[0_0_0_4px_rgba(232,83,14,0.08)] disabled:opacity-50',
						invalid ? 'border-red-400' : d ? 'border-charcoal/50' : 'border-charcoal/15 hover:border-charcoal/30',
						i === 2 && 'mr-2 sm:mr-4',
					)}
				/>
			))}
		</div>
	);
}

'use client';

import { memo } from 'react';
import { clsx } from 'clsx';

/** "Your card (n)" — the appointment card / cart trigger in the masthead. */
export const CartPill = memo(function CartPill({ count, onClick }: { count: number; onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={`Your card, ${count} ${count === 1 ? 'item' : 'items'}`}
			aria-haspopup="dialog"
			className={clsx(
				'group inline-flex h-9 items-center gap-2 border px-3.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] outline-none transition-colors duration-500 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-accent',
				count > 0
					? 'border-charcoal bg-charcoal text-white hover:border-accent hover:bg-accent'
					: 'border-line-strong text-charcoal hover:border-charcoal',
			)}
		>
			<span aria-hidden className="sm:hidden">
				Card
			</span>
			<span aria-hidden className="max-sm:hidden">
				Your card
			</span>
			<span aria-hidden className="tabular">
				({count})
			</span>
		</button>
	);
});

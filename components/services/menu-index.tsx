'use client';

import { memo } from 'react';
import { clsx } from 'clsx';
import type { ProductListItemResponse as Product } from '@opencals/storefront-sdk';

interface MenuIndexProps {
	products: Product[];
	activeSlug: string | null;
	onJump: (slug: string) => void;
}

/** Sticky contents rail (desktop): "01 Color Correction"… the row in view is inked, the rest stay grey. */
export const MenuIndex = memo(function MenuIndex({ products, activeSlug, onJump }: MenuIndexProps) {
	return (
		<nav aria-label="Menu contents" className="sticky top-32">
			<p className="eyebrow text-warm-gray">Contents</p>
			<ol className="mt-6 space-y-3 border-l border-line">
				{products.map((product, i) => {
					const active = product.slug === activeSlug;
					return (
						<li key={product.id}>
							<button
								type="button"
								onClick={() => onJump(product.slug)}
								aria-current={active ? 'true' : undefined}
								className={clsx(
									'-ml-px flex w-full items-baseline gap-3 border-l py-0.5 pl-4 text-left text-sm transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-accent',
									active ? 'border-brass text-charcoal' : 'border-transparent text-warm-gray hover:text-charcoal',
								)}
							>
								<span className="tabular text-[0.7rem] text-brass">{String(i + 1).padStart(2, '0')}</span>
								<span className={clsx(active && 'font-display italic text-base')}>{product.title}</span>
							</button>
						</li>
					);
				})}
			</ol>
		</nav>
	);
});

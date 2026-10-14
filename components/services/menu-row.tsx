'use client';

import { memo } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { ProductListItemResponse as Product, ProductListVariant as Variant } from '@opencals/storefront-sdk';
import { formatDuration, formatPrice, getProductImage } from '@/lib/format';
import { buttonClasses } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { StaffAvatars } from '@/components/ui/staff-avatars';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { RevealArch } from '@/components/motion/reveal-arch';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { EASE_OUT } from '@/components/motion/easing';
import { DisplayTitle } from './display-title';
import { serviceBlurb } from './service-copy';
import { bookingHref, durationRange, fromPrice, productImage } from './menu-utils';

const PANEL_INITIAL = { height: 0, opacity: 0 };
const PANEL_ANIMATE = { height: 'auto', opacity: 1 };
const PANEL_EXIT = { height: 0, opacity: 0 };
const PANEL_TRANSITION = { height: { duration: 0.7, ease: EASE_OUT }, opacity: { duration: 0.4, ease: EASE_OUT } };
const NO_TRANSITION = { duration: 0 };

interface MenuRowProps {
	product: Product;
	/** Options to list (already filtered by the `?staff=` stylist, cheapest first). */
	variants: Variant[];
	index: number;
	expanded: boolean;
	onToggle: (slug: string) => void;
	onPreview: (src: string | null) => void;
	currency: string;
	staffId: string | null;
	locationId: string | null;
}

/**
 * One line of The Menu: plate number, display name, dotted leader, "from" price
 * and duration range. Expands in place to the arch plate, the standfirst and
 * the options, each with its own "Reserve".
 */
export const MenuRow = memo(function MenuRow({
	product,
	variants,
	index,
	expanded,
	onToggle,
	onPreview,
	currency,
	staffId,
	locationId,
}: MenuRowProps) {
	const reduce = useReducedMotion();
	const title = product.title ?? 'Service';
	const image = productImage(product);
	const number = String(index + 1).padStart(2, '0');
	const panelId = `menu-panel-${product.slug}`;
	const optionTitles = variants.map((v) => v.variantTitle).filter(Boolean);
	const staff = variants[0]?.staffMembers ?? [];

	return (
		<article id={`menu-${product.slug}`} className="scroll-mt-32 border-b border-line">
			<h2>
				<button
					type="button"
					aria-expanded={expanded}
					aria-controls={panelId}
					onClick={() => onToggle(product.slug)}
					onPointerEnter={() => onPreview(expanded ? null : image)}
					onPointerLeave={() => onPreview(null)}
					className="group grid w-full grid-cols-[2.25rem_minmax(0,1fr)_1.5rem] items-baseline gap-x-3 py-7 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:grid-cols-[3rem_minmax(0,1fr)_2rem] sm:gap-x-5 md:py-9"
				>
					<span className="tabular text-sm text-brass">{number}</span>
					<span className="min-w-0">
						<span className="flex items-baseline">
							<span className="display-sm text-charcoal transition-colors duration-500 group-hover:text-accent">
								<DisplayTitle text={title} />
							</span>
							<span className="leader-line hidden sm:block" aria-hidden />
							<span className="tabular ml-auto shrink-0 pl-4 text-sm text-charcoal sm:ml-0 sm:pl-0 sm:text-base">
								<span className="text-warm-gray">from </span>
								{formatPrice(fromPrice({ ...product, variants }), currency)}
							</span>
						</span>
						<span className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-warm-gray">
							{optionTitles.length > 1 ? <span>{optionTitles.join(' · ')}</span> : null}
							<span className="tabular text-xs">{durationRange({ ...product, variants })}</span>
						</span>
					</span>
					<span
						aria-hidden
						className={clsx(
							'relative mt-2 h-4 w-4 justify-self-end text-charcoal transition-transform duration-500 ease-[var(--ease-expo)]',
							expanded && 'rotate-45',
						)}
					>
						<span className="absolute top-1/2 left-0 h-px w-full bg-current" />
						<span className="absolute top-0 left-1/2 h-full w-px bg-current" />
					</span>
				</button>
			</h2>

			<AnimatePresence initial={false}>
				{expanded ? (
					<motion.div
						key="panel"
						id={panelId}
						initial={reduce ? false : PANEL_INITIAL}
						animate={PANEL_ANIMATE}
						exit={reduce ? undefined : PANEL_EXIT}
						transition={reduce ? NO_TRANSITION : PANEL_TRANSITION}
						className="overflow-hidden"
					>
						<div className="grid gap-10 pb-12 sm:pl-[4.25rem] md:grid-cols-12 md:gap-12 md:pb-16">
							<figure className="md:col-span-4">
								<div className="relative mx-auto w-full max-w-[17rem] md:max-w-none">
									<ArchOutline className="absolute -inset-2.5 h-[calc(100%+1.25rem)] w-[calc(100%+1.25rem)]" />
									<RevealArch trigger="mount" className="aspect-[3/4] w-full">
										<SafeImage src={image} alt={title} fill sizes="(min-width: 768px) 28vw, 70vw" className="object-cover" />
									</RevealArch>
								</div>
								<figcaption className="eyebrow mt-5 text-center text-warm-gray md:text-left">
									Pl. {number} · {title}
								</figcaption>
							</figure>

							<div className="md:col-span-8">
								<p className="max-w-[56ch] text-[17px] leading-[1.7] text-charcoal/80">{serviceBlurb(title, product.description)}</p>

								{staff.length > 0 ? (
									<div className="mt-6 flex items-center gap-4">
										<StaffAvatars staffMembers={staff} maxVisible={5} size="md" />
										<span className="eyebrow text-warm-gray">
											{staff.length} {staff.length === 1 ? 'chair' : 'chairs'}
										</span>
									</div>
								) : null}

								<p className="eyebrow mt-10 text-warm-gray">Choose your option</p>
								<ul className="mt-3 border-t border-line">
									{variants.map((variant) => (
										<OptionLine
											key={variant.id}
											variant={variant}
											currency={currency}
											href={bookingHref(variant.slug, { staffId, locationId })}
											single={variants.length === 1}
										/>
									))}
								</ul>
							</div>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>
		</article>
	);
});

function OptionLine({ variant, currency, href, single }: { variant: Variant; currency: string; href: string; single: boolean }) {
	const label = single ? 'Standard' : (variant.variantTitle ?? variant.title ?? 'Option');
	const thumb = getProductImage(variant);
	return (
		<li className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-line py-4 sm:flex-nowrap">
			<span className="arch-sm image-placeholder relative hidden h-12 w-9 shrink-0 sm:block">
				<SafeImage src={thumb} alt="" fill sizes="36px" className="object-cover" />
			</span>
			<span className="flex min-w-0 flex-1 items-baseline">
				<span className="font-display text-xl text-charcoal">{label}</span>
				<span className="leader-line" aria-hidden />
				<span className="tabular shrink-0 text-xs text-warm-gray">{formatDuration(variant.duration)}</span>
				<span className="tabular ml-4 shrink-0 text-base text-charcoal">{formatPrice(variant.price, currency)}</span>
			</span>
			<Link href={href} className={buttonClasses({ variant: 'outline', size: 'sm', className: 'w-full sm:w-auto' })}>
				Reserve
				<span aria-hidden className="transition-transform duration-500 group-hover/btn:translate-x-1">
					&rarr;
				</span>
				<span className="sr-only">
					{variant.title} {label}
				</span>
			</Link>
		</li>
	);
}

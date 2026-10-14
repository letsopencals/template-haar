'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { Reveal } from '@/components/motion/reveal';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_EXPO, EASE_OUT } from '@/components/motion/easing';
import { SafeImage } from '@/components/ui/safe-image';
import { SectionHeading } from '@/components/home/section-heading';
import { formatDurationRange, formatFromPrice, type MenuEntry } from '@/components/home/menu-data';

const FOLLOW = { stiffness: 180, damping: 22, mass: 0.6 } as const;
const PREVIEW_IN = { opacity: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 9999px 9999px 0px 0px)' } as const;
const PREVIEW_OUT = { opacity: 0, scale: 0.85, clipPath: 'inset(60% 20% 0% 20% round 9999px 9999px 0px 0px)' } as const;
const PREVIEW_TRANSITION = { duration: DURATION.base, ease: EASE_EXPO } as const;
const IMG_SWAP_IN = { opacity: 1, scale: 1 } as const;
const IMG_SWAP_OUT = { opacity: 0, scale: 1.08 } as const;
const IMG_SWAP_TRANSITION = { duration: DURATION.fast + 0.15, ease: EASE_OUT } as const;

function useFinePointer(): boolean {
	const [fine, setFine] = useState(false);
	useEffect(() => {
		const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
		const update = () => setFine(mql.matches);
		update();
		mql.addEventListener('change', update);
		return () => mql.removeEventListener('change', update);
	}, []);
	return fine;
}

interface RowProps {
	entry: MenuEntry;
	index: number;
	currency: string;
	onHover: (key: string | null) => void;
}

const MenuRow = memo(function MenuRow({ entry, index, currency, onHover }: RowProps) {
	const duration = formatDurationRange(entry.minDuration, entry.maxDuration);
	return (
		<li className="border-b border-line transition-opacity duration-500 group-hover/menu:opacity-40 hover:!opacity-100 focus-within:!opacity-100">
			<Link
				href={entry.href}
				onPointerEnter={() => onHover(entry.key)}
				className="group/row grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 py-6 outline-none focus-visible:bg-cream md:grid-cols-[4.5rem_1fr_auto] md:gap-x-6 md:py-8"
			>
				{/* Mobile thumbnail / desktop number */}
				<span className="relative row-span-2 md:row-span-1">
					<span className="arch-sm image-placeholder relative block h-[4.5rem] w-14 md:hidden">
						<SafeImage src={entry.imageUrl} alt="" fill sizes="56px" className="object-cover" />
					</span>
					<span className="tabular hidden text-sm text-brass md:block">{String(index + 1).padStart(2, '0')}</span>
				</span>

				<span className="min-w-0">
					<span className="flex items-baseline gap-3">
						<span className="tabular text-xs text-brass md:hidden">{String(index + 1).padStart(2, '0')}</span>
						<span className="display-sm block truncate text-charcoal transition-transform duration-700 ease-[var(--ease-expo)] group-hover/row:translate-x-3 group-hover/row:italic">
							{entry.title}
						</span>
					</span>
					{entry.options.length ? (
						<span className="mt-1.5 block truncate text-[0.8rem] text-warm-gray md:pl-0">{entry.options.join(' · ')}</span>
					) : null}
				</span>

				<span className="col-start-2 flex items-baseline md:col-start-auto md:min-w-[22rem]">
					<span className="leader-line hidden md:block" />
					<span className="tabular whitespace-nowrap text-sm text-charcoal">
						{entry.fromPrice !== null ? (
							<>
								<span className="text-warm-gray">from </span>
								{formatFromPrice(entry.fromPrice, currency)}
							</>
						) : (
							'Reserve'
						)}
					</span>
					{duration ? <span className="tabular ml-4 whitespace-nowrap text-xs text-warm-gray md:ml-6 md:w-24 md:text-right">{duration}</span> : null}
					<span
						aria-hidden
						className="ml-auto pl-4 text-warm-gray transition-all duration-500 group-hover/row:translate-x-1 group-hover/row:text-accent md:ml-6"
					>
						→
					</span>
				</span>
			</Link>
		</li>
	);
});

/** Cursor-following arch that shows the hovered service's photograph (fine pointers only). */
function CursorPreview({ entries, active, x, y }: { entries: MenuEntry[]; active: string | null; x: MotionValue<number>; y: MotionValue<number> }) {
	return (
		<motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-30 hidden md:block" style={{ x, y }}>
			<AnimatePresence>
				{active ? (
					<motion.div
						key="preview"
						className="arch image-placeholder relative -ml-32 -mt-48 h-80 w-64 shadow-float"
						initial={PREVIEW_OUT}
						animate={PREVIEW_IN}
						exit={PREVIEW_OUT}
						transition={PREVIEW_TRANSITION}
					>
						{entries.map((e) => (
							<motion.div
								key={e.key}
								className="absolute inset-0"
								initial={false}
								animate={e.key === active ? IMG_SWAP_IN : IMG_SWAP_OUT}
								transition={IMG_SWAP_TRANSITION}
							>
								<SafeImage src={e.imageUrl} alt="" fill sizes="256px" className="object-cover" />
							</motion.div>
						))}
					</motion.div>
				) : null}
			</AnimatePresence>
		</motion.div>
	);
}

/**
 * Nº 02 — The Menu: an editorial index of the salon's services built from the
 * live product list. Desktop hover shows a spring-followed arch preview of the
 * service; mobile gets an inline arch thumbnail per row.
 */
export function TheMenu({ entries, currency, optionCount }: { entries: MenuEntry[]; currency: string; optionCount: number }) {
	const fine = useFinePointer();
	const reduce = useReducedMotion();
	const [active, setActive] = useState<string | null>(null);
	const mx = useMotionValue(0);
	const my = useMotionValue(0);
	const x = useSpring(mx, FOLLOW);
	const y = useSpring(my, FOLLOW);
	const showPreview = fine && !reduce;

	const onMove = useCallback(
		(e: React.PointerEvent) => {
			if (e.pointerType !== 'mouse') return;
			mx.set(e.clientX);
			my.set(e.clientY);
		},
		[mx, my],
	);
	const onEnter = useCallback(
		(e: React.PointerEvent) => {
			// Jump (no spring) to the pointer so the preview never flies in from the corner.
			x.jump(e.clientX);
			y.jump(e.clientY);
			mx.set(e.clientX);
			my.set(e.clientY);
		},
		[mx, my, x, y],
	);
	const onHover = useCallback((key: string | null) => setActive(key), []);

	return (
		<section id="services" className="section-y bg-paper">
			<div className="container-x">
				<SectionHeading number="02" label="The Menu" title="The" accent="Menu">
					<Reveal>
						<p className="max-w-sm text-[15px] leading-relaxed text-charcoal/70">
							Eight disciplines, each with its own options. Prices are a starting point — your consultation settles the rest.
						</p>
					</Reveal>
				</SectionHeading>

				<ul className="group/menu mt-14 border-t border-charcoal md:mt-20" onPointerEnter={showPreview ? onEnter : undefined}
					onPointerMove={showPreview ? onMove : undefined} onPointerLeave={() => setActive(null)}>
					{entries.map((entry, i) => (
						<MenuRow key={entry.key} entry={entry} index={i} currency={currency} onHover={onHover} />
					))}
				</ul>

				<div className="mt-10 flex flex-wrap items-center justify-between gap-4">
					<span className="eyebrow tabular text-warm-gray">
						{entries.length} services{optionCount > entries.length ? ` · ${optionCount} options` : ''}
					</span>
					<Link href="/services" className="link-underline eyebrow text-charcoal">
						The full menu →
					</Link>
				</div>
			</div>
			{showPreview ? <CursorPreview entries={entries} active={active} x={x} y={y} /> : null}
		</section>
	);
}

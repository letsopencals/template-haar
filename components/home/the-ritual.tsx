'use client';

import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { clsx } from 'clsx';
import { Reveal } from '@/components/motion/reveal';
import { RevealArch } from '@/components/motion/reveal-arch';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { SafeImage } from '@/components/ui/safe-image';
import { SectionHeading } from '@/components/home/section-heading';
import type { MenuEntry } from '@/components/home/menu-data';

interface Step {
	title: string;
	accent: string;
	body: string;
	/** Product slug fragment whose API photo illustrates the step. */
	match: string;
	fallback: string;
	caption: string;
}

const STEPS: Step[] = [
	{
		title: 'The',
		accent: 'Consultation',
		body: "We begin seated, not at the basin. Ten unhurried minutes on your hair's history, your mornings and the photograph you saved.",
		match: 'color-correction',
		fallback: '/images/hero/hero-testimonials.jpg',
		caption: 'A conversation first',
	},
	{
		title: 'The',
		accent: 'Wash',
		body: "A slow, scented scalp ritual at the basin. Aromatherapy if you'd like it; quiet if you'd prefer.",
		match: 'scalp',
		fallback: '/images/gallery/keratin-shine.jpg',
		caption: 'At the basin',
	},
	{
		title: 'The',
		accent: 'Craft',
		body: 'Scissors, colour, keratin — whatever the plan, one stylist sees it through from the first section to the last.',
		match: 'haircuts',
		fallback: '/images/gallery/precision-cut.jpg',
		caption: 'One pair of hands',
	},
	{
		title: 'The',
		accent: 'Finish',
		body: 'Blown out, set and shown in the arched mirror. We note your formula, so next time starts where this one ended.',
		match: 'blow-dry',
		fallback: '/images/hero/hero-secondary.jpg',
		caption: 'In the mirror',
	},
];

const PROGRESS_SPRING = { stiffness: 120, damping: 30, restDelta: 0.001 } as const;
const SWAP = { duration: DURATION.base, ease: EASE_OUT } as const;
const NUM_IN = { y: '0%', opacity: 1 } as const;
const NUM_FROM = { y: '60%', opacity: 0 } as const;
const NUM_OUT = { y: '-60%', opacity: 0 } as const;
const IMG_SHOWN = { opacity: 1, scale: 1 } as const;
const IMG_HIDDEN = { opacity: 0, scale: 1.06 } as const;
const IMG_TRANSITION = { duration: DURATION.slow, ease: EASE_OUT } as const;

function useStepImages(entries: MenuEntry[]): string[] {
	return useMemo(
		() => STEPS.map((s) => entries.find((e) => e.slug.includes(s.match) && e.imageUrl)?.imageUrl ?? s.fallback),
		[entries],
	);
}

/** Desktop: a 4-screen scroll track with a pinned spread; numerals, copy and plates crossfade. */
function PinnedRitual({ images }: { images: string[] }) {
	const track = useRef<HTMLDivElement>(null);
	const [step, setStep] = useState(0);
	const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] });
	const progress = useSpring(scrollYProgress, PROGRESS_SPRING);

	useMotionValueEvent(scrollYProgress, 'change', (v) => {
		const next = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)));
		setStep((s) => (s === next ? s : next));
	});

	const current = STEPS[step]!;

	return (
		<div ref={track} className="relative" style={{ height: `${STEPS.length * 85}vh` }}>
			<div className="sticky top-0 flex h-[100svh] items-center">
				<div className="container-x grid w-full grid-cols-12 items-center gap-10">
					{/* Text block */}
					<div className="col-span-6 xl:col-span-5">
						<div className="flex items-start gap-8">
							<div className="relative h-[11rem] w-[13rem] overflow-hidden" aria-hidden>
								<AnimatePresence initial={false} mode="popLayout">
									<motion.span
										key={step}
										className="font-display absolute inset-0 block text-[10rem] leading-none tracking-[-0.04em] text-brass/80 [font-variant-numeric:lining-nums_tabular-nums]"
										initial={NUM_FROM}
										animate={NUM_IN}
										exit={NUM_OUT}
										transition={SWAP}
									>
										{String(step + 1).padStart(2, '0')}
									</motion.span>
								</AnimatePresence>
							</div>
							{/* Progress hairline */}
							<div className="relative mt-3 h-40 w-px bg-line">
								<motion.span className="absolute inset-0 origin-top bg-accent" style={{ scaleY: progress }} />
							</div>
						</div>

						<div className="relative mt-8 min-h-[16rem]" aria-live="polite">
							<AnimatePresence initial={false} mode="wait">
								<motion.div key={step} initial={NUM_FROM} animate={NUM_IN} exit={NUM_OUT} transition={SWAP}>
									<h3 className="display-md text-charcoal">
										{current.title} <em className="text-accent">{current.accent}</em>
									</h3>
									<p className="mt-6 max-w-[42ch] text-[17px] leading-[1.7] text-charcoal/75">{current.body}</p>
								</motion.div>
							</AnimatePresence>
						</div>

						<ol className="mt-6 flex gap-6">
							{STEPS.map((s, i) => (
								<li key={s.accent} className={clsx('eyebrow transition-colors duration-500', i === step ? 'text-charcoal' : 'text-warm-gray-light')}>
									<span className="tabular">{String(i + 1).padStart(2, '0')}</span> {s.accent}
								</li>
							))}
						</ol>
					</div>

					{/* Plate */}
					<div className="col-span-6 col-start-7 xl:col-span-5 xl:col-start-8">
						<figure className="relative mx-auto w-full max-w-[min(28rem,56svh)]">
							<ArchOutline className="absolute -left-5 -top-5 h-full w-full" />
							<div className="arch image-placeholder relative aspect-[4/5] w-full">
								{images.map((src, i) => (
									<motion.div
										key={STEPS[i]!.accent}
										className="absolute inset-0"
										initial={false}
										animate={i === step ? IMG_SHOWN : IMG_HIDDEN}
										transition={IMG_TRANSITION}
									>
										<SafeImage src={src} alt={i === step ? STEPS[i]!.caption : ''} fill sizes="(min-width: 1280px) 448px, 45vw" className="object-cover" />
									</motion.div>
								))}
							</div>
							<figcaption className="mt-3 flex justify-between border-t border-line pt-2 text-[0.72rem] text-warm-gray">
								<span className="tabular text-brass">Pl. {String(step + 3).padStart(2, '0')}</span>
								<span className="italic-display text-charcoal">{current.caption}</span>
							</figcaption>
						</figure>
					</div>
				</div>
			</div>
		</div>
	);
}

/** Mobile + reduced motion: the four steps as a numbered stack. */
function StackedRitual({ images }: { images: string[] }) {
	return (
		<ol className="container-x mt-14 grid gap-14 sm:grid-cols-2">
			{STEPS.map((s, i) => (
				<Reveal as="li" key={s.accent} delay={(i % 2) * 0.08}>
					<RevealArch className="aspect-[4/5] w-full">
						<SafeImage src={images[i]} alt={s.caption} fill sizes="(min-width: 640px) 45vw, 90vw" className="object-cover" />
					</RevealArch>
					<div className="mt-5 flex items-baseline gap-4">
						<span className="tabular text-3xl text-brass">{String(i + 1).padStart(2, '0')}</span>
						<h3 className="display-sm text-charcoal">
							{s.title} <em className="text-accent">{s.accent}</em>
						</h3>
					</div>
					<p className="mt-3 text-[15px] leading-relaxed text-charcoal/75">{s.body}</p>
				</Reveal>
			))}
		</ol>
	);
}

/**
 * Nº 03 — The Ritual: what happens in the chair, in four steps. Pinned and
 * scroll-driven on desktop; a simple stacked list on mobile / reduced motion.
 */
export function TheRitual({ entries }: { entries: MenuEntry[] }) {
	const reduce = useReducedMotion();
	const images = useStepImages(entries);

	return (
		<section id="cta" className="bg-cream pt-24 md:pt-36">
			<div className="container-x">
				<SectionHeading number="03" label="The Ritual" title="An hour," accent="unhurried">
					<Reveal>
						<p className="max-w-sm text-[15px] leading-relaxed text-charcoal/70">
							Every appointment follows the same four movements, whichever service you book.
						</p>
					</Reveal>
				</SectionHeading>
			</div>

			{reduce ? null : (
				<div className="hidden lg:block">
					<PinnedRitual images={images} />
				</div>
			)}
			<div className={clsx('pb-24 md:pb-36', reduce ? null : 'lg:hidden')}>
				<StackedRitual images={images} />
			</div>
		</section>
	);
}

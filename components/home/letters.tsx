'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { RevealArch } from '@/components/motion/reveal-arch';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { SectionHeading } from '@/components/home/section-heading';
import { siteConfig } from '@/lib/site-config';
import testimonialsImage from '@/public/images/hero/hero-testimonials.jpg';

const LETTERS = siteConfig.testimonials;
const AUTOPLAY_MS = 8000;
const QUOTE_FROM = { opacity: 0, y: 24 } as const;
const QUOTE_IN = { opacity: 1, y: 0 } as const;
const QUOTE_OUT = { opacity: 0, y: -16 } as const;
const QUOTE_TRANSITION = { duration: DURATION.base, ease: EASE_OUT } as const;

/** Nº 06 — Letters: client testimonials as oversized pull quotes that crossfade. */
export function Letters() {
	const reduce = useReducedMotion();
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const go = useCallback((dir: 1 | -1) => setIndex((i) => (i + dir + LETTERS.length) % LETTERS.length), []);

	useEffect(() => {
		if (reduce || paused) return;
		const id = window.setTimeout(() => go(1), AUTOPLAY_MS);
		return () => window.clearTimeout(id);
	}, [index, reduce, paused, go]);

	const letter = LETTERS[index]!;

	return (
		<section id="testimonials" className="section-y overflow-hidden bg-cream">
			<div className="container-x">
				<SectionHeading number="06" label="Letters" title="Kind" accent="words" size="md" />

				<div className="mt-14 grid items-center gap-14 md:mt-20 lg:grid-cols-12 lg:gap-10">
					<figure className="relative mx-auto w-full max-w-[22rem] lg:col-span-4 lg:mx-0">
						<ArchOutline className="absolute -right-4 -top-4 h-full w-full" />
						<RevealArch className="aspect-[3/4] w-full">
							<Image src={testimonialsImage} alt="Clients in the mirror at HAAR" fill placeholder="blur" sizes="(min-width: 1024px) 352px, 80vw" className="object-cover object-[30%_50%]" />
						</RevealArch>
						<figcaption className="mt-3 flex justify-between border-t border-line pt-2 text-[0.72rem] text-warm-gray">
							<span className="tabular text-brass">Pl. 13</span>
							<span className="italic-display text-charcoal">Saturday, late morning</span>
						</figcaption>
					</figure>

					<div
						className="relative lg:col-span-8 lg:pl-10"
						onPointerEnter={() => setPaused(true)}
						onPointerLeave={() => setPaused(false)}
						onFocusCapture={() => setPaused(true)}
						onBlurCapture={() => setPaused(false)}
					>
						<span aria-hidden className="pointer-events-none absolute -left-2 -top-16 font-display text-[12rem] leading-none text-brass/30 lg:-top-24 lg:left-4 lg:text-[16rem]">
							“
						</span>
						<div className="relative min-h-[22rem] sm:min-h-[18rem] lg:min-h-[24rem]" aria-live="polite">
							<AnimatePresence mode="wait" initial={false}>
								<motion.blockquote key={index} initial={QUOTE_FROM} animate={QUOTE_IN} exit={QUOTE_OUT} transition={QUOTE_TRANSITION}>
									<p className="font-display text-[1.75rem] italic leading-[1.18] tracking-[-0.015em] text-charcoal sm:text-[2.25rem] lg:text-[2.85rem]">
										{letter.quote}
									</p>
									<footer className="mt-8 flex items-center gap-4">
										<span className="h-px w-10 bg-brass" />
										<span className="eyebrow text-charcoal">{letter.author}</span>
										<span className="text-[0.8rem] text-warm-gray">{letter.role}</span>
									</footer>
								</motion.blockquote>
							</AnimatePresence>
						</div>

						<div className="mt-10 flex items-center gap-6">
							<span className="tabular text-sm text-charcoal">
								{String(index + 1).padStart(2, '0')} <span className="text-warm-gray">/ {String(LETTERS.length).padStart(2, '0')}</span>
							</span>
							<div className="flex gap-2">
								{LETTERS.map((l, i) => (
									<button
										key={l.author}
										type="button"
										onClick={() => setIndex(i)}
										aria-label={`Letter ${i + 1}: ${l.author}`}
										aria-current={i === index}
										className="group/dot flex h-8 items-center outline-none focus-visible:outline-1 focus-visible:outline-accent"
									>
										<span className={clsx('block h-px transition-all duration-500', i === index ? 'w-10 bg-accent' : 'w-5 bg-line-strong group-hover/dot:bg-charcoal')} />
									</button>
								))}
							</div>
							<div className="ml-auto flex gap-1">
								<button type="button" onClick={() => go(-1)} aria-label="Previous letter" className="flex h-11 w-11 items-center justify-center border border-line text-charcoal transition-colors hover:border-charcoal focus-visible:outline-2 focus-visible:outline-accent">
									←
								</button>
								<button type="button" onClick={() => go(1)} aria-label="Next letter" className="flex h-11 w-11 items-center justify-center border border-line text-charcoal transition-colors hover:border-charcoal focus-visible:outline-2 focus-visible:outline-accent">
									→
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

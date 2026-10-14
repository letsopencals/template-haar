'use client';

import { useEffect, useRef, useState } from 'react';
import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { clsx } from 'clsx';
import { Reveal } from '@/components/motion/reveal';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { SectionHeading } from '@/components/home/section-heading';
import balayage from '@/public/images/gallery/balayage.jpg';
import precisionCut from '@/public/images/gallery/precision-cut.jpg';
import keratinShine from '@/public/images/gallery/keratin-shine.jpg';
import colorArt from '@/public/images/gallery/color-art.jpg';
import bridalUpdo from '@/public/images/gallery/bridal-updo.jpg';
import naturalTexture from '@/public/images/gallery/natural-texture.jpg';

interface Plate {
	image: StaticImageData;
	title: string;
	note: string;
	shape: 'tall' | 'wide';
	position: string;
}

const PLATES: Plate[] = [
	{ image: balayage, title: 'Balayage', note: 'Hand-painted, lived-in', shape: 'tall', position: 'object-[48%_40%]' },
	{ image: precisionCut, title: 'The precision bob', note: 'Cut dry, finished sharp', shape: 'wide', position: 'object-[70%_45%]' },
	{ image: colorArt, title: 'Copper', note: 'Gloss over a warm base', shape: 'tall', position: 'object-[32%_40%]' },
	{ image: keratinShine, title: 'Keratin shine', note: 'Twelve weeks of calm', shape: 'wide', position: 'object-[55%_50%]' },
	{ image: bridalUpdo, title: 'The bridal set', note: 'Soft, pinned, unfussy', shape: 'tall', position: 'object-[55%_35%]' },
	{ image: naturalTexture, title: 'Natural texture', note: 'Air-dry, defined', shape: 'wide', position: 'object-[60%_45%]' },
];

const PLATE_OFFSET = 7; // Plate numbers continue after the hero + ritual plates.
const TRACK_SPRING = { stiffness: 90, damping: 26, mass: 0.6 } as const;

function PlateFigure({ plate, index, className, sizes }: { plate: Plate; index: number; className?: string; sizes: string }) {
	return (
		<figure className={clsx('group/plate shrink-0', className)}>
			<div className={clsx('image-placeholder relative overflow-hidden', plate.shape === 'tall' ? 'aspect-[4/5]' : 'aspect-[3/2]')}>
				<Image
					src={plate.image}
					alt={`${plate.title} — ${plate.note}`}
					fill
					placeholder="blur"
					sizes={sizes}
					className={clsx('object-cover transition-transform duration-[1.6s] ease-[var(--ease-expo)] group-hover/plate:scale-[1.04]', plate.position)}
				/>
			</div>
			<figcaption className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-2 text-[0.75rem]">
				<span>
					<span className="tabular text-brass">Pl. {String(index + PLATE_OFFSET).padStart(2, '0')}</span>
					<span className="text-warm-gray"> · </span>
					<span className="italic-display text-[0.95rem] text-charcoal">{plate.title}</span>
				</span>
				<span className="text-warm-gray">{plate.note}</span>
			</figcaption>
		</figure>
	);
}

/** Desktop: vertical scroll drives the plate strip sideways while the section is pinned. */
function ScrollLinkedStrip() {
	const track = useRef<HTMLDivElement>(null);
	const strip = useRef<HTMLDivElement>(null);
	const [distance, setDistance] = useState(0);
	const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] });
	const smooth = useSpring(scrollYProgress, TRACK_SPRING);
	const x = useTransform(smooth, [0, 1], [0, -distance]);
	const counter = useTransform(scrollYProgress, (v) => String(Math.min(PLATES.length, Math.floor(v * PLATES.length) + 1)).padStart(2, '0'));

	useEffect(() => {
		const el = strip.current;
		if (!el) return;
		const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		window.addEventListener('resize', measure);
		return () => {
			ro.disconnect();
			window.removeEventListener('resize', measure);
		};
	}, []);

	return (
		<div ref={track} className="relative" style={{ height: `calc(100svh + ${distance}px)` }}>
			<div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
				<motion.div ref={strip} className="flex w-max items-end gap-12 px-10 will-change-transform" style={{ x }}>
					{PLATES.map((p, i) => (
						<PlateFigure key={p.title} plate={p} index={i} sizes="44vw" className={p.shape === 'tall' ? 'w-[min(26vw,48svh)]' : 'w-[min(44vw,80svh)]'} />
					))}
					<div className="flex w-[22vw] shrink-0 flex-col justify-end pb-10">
						<p className="font-display text-4xl italic leading-tight text-charcoal">Your turn in the mirror.</p>
						<Link href="/services" className="link-underline eyebrow mt-6 self-start text-charcoal">
							Reserve your chair →
						</Link>
					</div>
				</motion.div>
				<div className="container-x mt-10 flex items-center gap-4 text-warm-gray">
					<motion.span className="tabular text-sm text-charcoal">{counter}</motion.span>
					<span className="relative h-px w-40 bg-line">
						<motion.span className="absolute inset-0 origin-left bg-accent" style={{ scaleX: smooth }} />
					</span>
					<span className="tabular text-sm">{String(PLATES.length).padStart(2, '0')}</span>
				</div>
			</div>
		</div>
	);
}

/** Mobile / reduced motion: native swipe with snap points. */
function SwipeStrip() {
	return (
		<ul className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-4">
			{PLATES.map((p, i) => (
				<li key={p.title} className="snap-start">
					<PlateFigure plate={p} index={i} sizes="(min-width: 640px) 60vw, 82vw" className={p.shape === 'tall' ? 'w-[70vw] sm:w-[40vw]' : 'w-[82vw] sm:w-[60vw]'} />
				</li>
			))}
		</ul>
	);
}

/** Nº 05 — Lookbook: the gallery as numbered magazine plates. */
export function Lookbook() {
	const reduce = useReducedMotion();
	return (
		<section id="gallery" className="bg-paper pt-24 md:pt-36">
			<div className="container-x">
				<SectionHeading number="05" label="Lookbook" title="Recent" accent="work">
					<Reveal>
						<p className="max-w-sm text-[15px] leading-relaxed text-charcoal/70">Six plates from the floor this season. Bring one along — it helps.</p>
					</Reveal>
				</SectionHeading>
			</div>
			{reduce ? null : (
				<div className="hidden lg:block">
					<ScrollLinkedStrip />
				</div>
			)}
			<div className={clsx('pb-24 md:pb-36', reduce ? null : 'lg:hidden')}>
				<SwipeStrip />
			</div>
		</section>
	);
}

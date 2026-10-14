'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { RevealArch } from '@/components/motion/reveal-arch';
import { Reveal } from '@/components/motion/reveal';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { SafeImage } from '@/components/ui/safe-image';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';
import { siteConfig } from '@/lib/site-config';

const QUOTE_INTERVAL_MS = 7000;
const QUOTE_INITIAL = { opacity: 0, y: 14 } as const;
const QUOTE_ANIMATE = { opacity: 1, y: 0 } as const;
const QUOTE_EXIT = { opacity: 0, y: -10 } as const;
const QUOTE_FADE_ONLY = { opacity: 0 } as const;
const QUOTE_TRANSITION = { duration: DURATION.base, ease: EASE_OUT } as const;

const DEFAULT_IMAGE = '/images/hero/hero-testimonials.jpg';

export interface AuthShellProps {
	/** Masthead line above the title, e.g. "Nº 00 — Members". */
	eyebrow?: string;
	/** Display headline. Put the emotional word in <em>. */
	title: React.ReactNode;
	intro?: React.ReactNode;
	children: React.ReactNode;
	/** Line under the form ("New to HAAR? Create an account"). */
	footer?: React.ReactNode;
	/** Left-hand photograph (local /images path). */
	image?: string;
	/** Plate caption under the photograph. */
	plate?: string;
}

/**
 * Split-screen frame for every auth page: on the left a salon photograph in
 * the signature arch with a rotating "Letters" pull-quote, on the right the
 * form on paper under a masthead. On mobile the photo shrinks to a short arch
 * banner above the form.
 */
export function AuthShell({
	eyebrow = 'Nº 00 — Members',
	title,
	intro,
	children,
	footer,
	image = DEFAULT_IMAGE,
	plate = 'Pl. 01 · The Salon',
}: AuthShellProps) {
	return (
		<section className="grain relative min-h-[100svh] bg-paper lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
			{/* Photograph + letters (desktop) */}
			<aside className="relative hidden overflow-hidden border-r border-line bg-cream lg:block">
				<div className="sticky top-0 flex h-[100svh] flex-col px-12 pt-28 pb-12 xl:px-20">
					<div className="relative mx-auto w-full max-w-[420px] flex-1 min-h-0">
						<ArchOutline className="absolute -inset-3 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)]" />
						<RevealArch trigger="mount" className="h-full w-full">
							<SafeImage src={image} alt="" fill priority sizes="(min-width: 1024px) 420px, 0px" className="object-cover" />
						</RevealArch>
					</div>
					<p className="tabular mt-6 text-center text-[0.7rem] text-brass">{plate}</p>
					<RotatingLetter />
				</div>
			</aside>

			{/* Form column */}
			<div className="relative flex flex-col px-5 pt-24 pb-16 sm:px-10 lg:min-h-[100svh] lg:justify-center lg:px-16 lg:pt-28 xl:px-24">
				{/* Mobile arch banner */}
				<div className="relative mx-auto mb-10 w-full max-w-[22rem] lg:hidden">
					<RevealArch trigger="mount" className="h-40 w-full sm:h-48">
						<SafeImage src={image} alt="" fill priority sizes="(max-width: 1023px) 22rem, 0px" className="object-cover object-[50%_35%]" />
					</RevealArch>
					<p className="tabular mt-3 text-center text-[0.65rem] text-brass">{plate}</p>
				</div>

				<div className="mx-auto w-full max-w-[440px]">
					<Reveal>
						<div className="flex items-center gap-3">
							<Link href="/" className="font-display text-xl tracking-tight text-charcoal" aria-label={`${siteConfig.name} home`}>
								{siteConfig.logo.text}
								<span className="text-accent">{siteConfig.logo.accent}</span>
							</Link>
							<span aria-hidden className="h-px flex-1 bg-brass/50" />
							<span className="eyebrow text-warm-gray">{eyebrow}</span>
						</div>
						<h1 className="display-md mt-8 text-charcoal [&_em]:text-accent">{title}</h1>
						{intro ? <div className="mt-5 max-w-[38ch] text-[15px] leading-relaxed text-warm-gray">{intro}</div> : null}
					</Reveal>

					<Reveal delay={0.12} className="mt-10">
						{children}
					</Reveal>

					{footer ? (
						<div className="mt-12 border-t border-line pt-6 text-center text-sm text-warm-gray">{footer}</div>
					) : null}
				</div>
			</div>
		</section>
	);
}

/** Underlined inline link used in auth footers. */
export function AuthLink({ href, children }: { href: string; children: React.ReactNode }) {
	return (
		<Link href={href} className="link-underline font-medium text-charcoal transition-colors hover:text-accent">
			{children}
		</Link>
	);
}

/** The testimonials from siteConfig, crossfading on a slow loop (paused for reduced motion). */
function RotatingLetter() {
	const letters = siteConfig.testimonials;
	const reduce = useReducedMotion();
	const [index, setIndex] = useState(0);

	useEffect(() => {
		if (reduce || letters.length < 2) return;
		const id = setInterval(() => setIndex((i) => (i + 1) % letters.length), QUOTE_INTERVAL_MS);
		return () => clearInterval(id);
	}, [reduce, letters.length]);

	const letter = letters[index];
	if (!letter) return null;

	return (
		<figure className="relative mx-auto mt-8 w-full max-w-[460px] text-center" aria-live="off">
			<p className="eyebrow mb-4 text-brass">Letters</p>
			<div className="relative min-h-[9.5rem]">
				<AnimatePresence mode="wait" initial={false}>
					<motion.blockquote
						key={index}
						initial={reduce ? QUOTE_FADE_ONLY : QUOTE_INITIAL}
						animate={QUOTE_ANIMATE}
						exit={reduce ? QUOTE_FADE_ONLY : QUOTE_EXIT}
						transition={QUOTE_TRANSITION}
					>
						<p className="font-display text-[1.35rem] leading-snug text-charcoal italic xl:text-[1.5rem]">
							&ldquo;{shorten(letter.quote)}&rdquo;
						</p>
						<figcaption className="eyebrow mt-4 text-warm-gray">
							{letter.author} <span className="text-brass">·</span> {letter.role}
						</figcaption>
					</motion.blockquote>
				</AnimatePresence>
			</div>
			{letters.length > 1 ? (
				<div className="mt-4 flex justify-center gap-2" aria-hidden>
					{letters.map((l, i) => (
						<span
							key={l.author}
							className={`h-px transition-all duration-700 ${i === index ? 'w-8 bg-charcoal' : 'w-3 bg-line-strong'}`}
						/>
					))}
				</div>
			) : null}
		</figure>
	);
}

/** Keep the pull-quote to its first sentence or two so it fits the plate. */
function shorten(quote: string): string {
	const sentences = quote.match(/[^.!?]+[.!?]+/g) ?? [quote];
	let out = '';
	for (const s of sentences) {
		if ((out + s).length > 150 && out) break;
		out += s;
	}
	return out.trim();
}

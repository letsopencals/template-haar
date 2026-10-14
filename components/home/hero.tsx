'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { IntroCurtain } from '@/components/motion/intro-curtain';
import { Reveal, RevealText } from '@/components/motion/reveal';
import { RevealArch } from '@/components/motion/reveal-arch';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { Seal } from '@/components/motifs/seal';
import { buttonClasses } from '@/components/ui/button';
import { OpenTodayChip } from '@/components/home/open-today-chip';
import { siteConfig } from '@/lib/site-config';
import heroMain from '@/public/images/hero/hero-main.jpg';
import heroSecondary from '@/public/images/hero/hero-secondary.jpg';

const SCROLL_OFFSET = ['start start', 'end start'] as const;

/**
 * Nº 01 — the masthead. Giant line-masked headline, the salon's arched mirror
 * as the hero plate (LCP: `priority`), an offset secondary plate, a brass arch
 * ornament and a slowly turning seal. The intro curtain plays over it once per
 * session.
 */
export function Hero({ issueLabel }: { issueLabel: string }) {
	const ref = useRef<HTMLElement>(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({ target: ref, offset: [...SCROLL_OFFSET] });
	const plateScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
	const plateY = useTransform(scrollYProgress, [0, 1], ['0%', '6%']);
	const secondaryY = useTransform(scrollYProgress, [0, 1], ['0%', '-38%']);
	const headlineY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);

	return (
		<section id="hero" ref={ref} className="relative overflow-hidden bg-paper pt-24 md:pt-28">
			<IntroCurtain />

			{/* Masthead strip */}
			<div className="container-x">
				<div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
					<span className="eyebrow tabular text-warm-gray">{issueLabel}</span>
					<span className="eyebrow hidden text-charcoal md:inline">
						{siteConfig.name} — {siteConfig.tagline}
					</span>
					<OpenTodayChip />
				</div>
			</div>

			<div className="container-x relative grid gap-12 pb-20 pt-10 md:pb-28 lg:grid-cols-12 lg:gap-8 lg:pt-8">
				{/* Copy column */}
				<motion.div className="relative z-10 lg:col-span-7 lg:pt-2" style={reduce ? undefined : { y: headlineY }}>
					<span className="eyebrow text-warm-gray">Nº 01 — {siteConfig.hero.subtitle}</span>
					<h1 className="display-xl mt-6 text-charcoal">
						<RevealText as="span" className="block" lineClassName="pb-[0.06em]" text="The Art of" trigger="mount" delay={0.15} />
						<RevealText
							as="span"
							className="block pl-[0.6em] italic text-accent"
							lineClassName="pb-[0.12em] font-display italic"
							text={siteConfig.hero.headingAccent}
							trigger="mount"
							delay={0.3}
						/>
					</h1>

					<div className="mt-10 grid gap-10 sm:grid-cols-[1fr_auto] sm:items-end lg:mt-10 lg:max-w-[40rem]">
						<Reveal delay={0.5}>
							<p className="max-w-sm text-[17px] leading-[1.7] text-charcoal/75">{siteConfig.hero.body}</p>
							<div className="mt-8 flex flex-wrap items-center gap-6">
								<Link href="/services" className={buttonClasses({ variant: 'primary', size: 'lg' })}>
									Reserve your chair
									<span aria-hidden className="transition-transform duration-500 group-hover/btn:translate-x-1">
										→
									</span>
								</Link>
								<Link href="#services" className="link-underline eyebrow text-charcoal">
									Read the menu
								</Link>
							</div>
						</Reveal>

						{/* Offset secondary plate */}
						<motion.figure className="relative hidden w-40 sm:block lg:w-44" style={reduce ? undefined : { y: secondaryY }}>
							<RevealArch className="aspect-[3/4] w-full" trigger="mount" delay={0.55}>
								<Image
									src={heroSecondary}
									alt="A stylist finishing a blow-dry"
									fill
									sizes="176px"
									placeholder="blur"
									className="object-cover object-[55%_50%]"
								/>
							</RevealArch>
							<figcaption className="mt-2 flex justify-between text-[0.7rem] text-warm-gray">
								<span className="tabular text-brass">Pl. 02</span>
								<span className="italic-display">The finish</span>
							</figcaption>
						</motion.figure>
					</div>
				</motion.div>

				{/* Hero plate */}
				<div className="relative lg:col-span-5">
					<figure className="relative mx-auto w-full max-w-[30rem] lg:ml-auto">
						<ArchOutline className="absolute -right-4 -top-4 h-full w-full md:-right-6 md:-top-6" />
						<RevealArch className="aspect-[3/4] w-full md:aspect-[5/7]" trigger="mount" delay={0.1}>
							<motion.div className="absolute inset-0" style={reduce ? undefined : { scale: plateScale, y: plateY }}>
								<Image
									src={heroMain}
									alt="The HAAR salon floor with its arched mirrors"
									fill
									priority
									placeholder="blur"
									sizes="(min-width: 1440px) 480px, (min-width: 1024px) 36vw, 92vw"
									className="object-cover object-[42%_50%]"
								/>
							</motion.div>
						</RevealArch>
						<figcaption className="mt-3 flex items-baseline justify-between border-t border-line pt-2 text-[0.72rem] text-warm-gray">
							<span className="tabular text-brass">Pl. 01</span>
							<span>
								<span className="italic-display text-charcoal">The arched mirror</span> · Bleecker St.
							</span>
						</figcaption>
						<div className="absolute -bottom-8 -left-8 hidden md:block lg:-left-16">
							<Seal motion="spin" size={128} className="bg-paper/80 rounded-full" />
						</div>
					</figure>
				</div>
			</div>

			{/* Scroll cue */}
			<div aria-hidden className="container-x flex items-center gap-4 pb-6 text-warm-gray">
				<span className="eyebrow">Scroll</span>
				<span className="h-px w-16 bg-brass/60" />
				<span className="eyebrow tabular">01 / 08</span>
			</div>
		</section>
	);
}

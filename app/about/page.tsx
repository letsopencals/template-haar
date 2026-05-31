'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import mainImage from '@/public/images/about/main.jpg';
import secondaryImage from '@/public/images/about/secondary.jpg';

function StorySection() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, {once: true, margin: '-100px'});

	return (
		<section ref={ref} className="bg-white py-section-sm lg:py-section">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="grid items-center gap-16 lg:grid-cols-2">
					{/* Images */}
					<motion.div
						initial={{opacity: 0, x: -30}}
						animate={isInView ? {opacity: 1, x: 0} : {}}
						transition={{duration: 0.8}}
						className="relative"
					>
						<div className="grid grid-cols-12 gap-4">
							<div className="col-span-7 aspect-[3/4] overflow-hidden">
								<img src={mainImage.src} className="image-placeholder h-full w-full object-cover"/>
							</div>
							<div className="col-span-5 mt-12 aspect-[3/4] overflow-hidden">
								<img src={secondaryImage.src} className="image-placeholder h-full w-full object-cover"/>
							</div>
						</div>
						{/* Accent bar */}
						<div className="absolute -bottom-4 left-0 h-2 w-24 bg-accent"/>
					</motion.div>

					{/* Content */}
					<div>
						<motion.p
							initial={{opacity: 0, y: 20}}
							animate={isInView ? {opacity: 1, y: 0} : {}}
							transition={{duration: 0.6, delay: 0.2}}
							className="text-xs font-semibold uppercase tracking-[0.3em] text-accent"
						>
							Our Story
						</motion.p>
						<motion.h2
							initial={{opacity: 0, y: 30}}
							animate={isInView ? {opacity: 1, y: 0} : {}}
							transition={{duration: 0.7, delay: 0.3}}
							className="heading-display mt-4 text-4xl text-charcoal md:text-5xl"
						>
							BORN FROM
							<br/>
							<span className="heading-display-italic text-accent">Passion</span>
						</motion.h2>
						<motion.div
							initial={{opacity: 0, y: 20}}
							animate={isInView ? {opacity: 1, y: 0} : {}}
							transition={{duration: 0.6, delay: 0.5}}
							className="mt-8 space-y-4 text-base leading-relaxed text-warm-gray"
						>
							{siteConfig.about.storyParagraphs.map((p, i) => (
								<p key={i}>{p}</p>
							))}
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}

function ValuesSection() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, {once: true, margin: '-100px'});

	return (
		<section ref={ref} className="noise-overlay relative bg-charcoal py-section-sm lg:py-section">
			<div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10">
				<motion.p
					initial={{opacity: 0, y: 20}}
					animate={isInView ? {opacity: 1, y: 0} : {}}
					transition={{duration: 0.6}}
					className="text-xs font-semibold uppercase tracking-[0.3em] text-accent"
				>
					What Drives Us
				</motion.p>
				<motion.h2
					initial={{opacity: 0, y: 30}}
					animate={isInView ? {opacity: 1, y: 0} : {}}
					transition={{duration: 0.7, delay: 0.1}}
					className="heading-display mt-4 text-5xl text-white md:text-6xl"
				>
					OUR VALUES
				</motion.h2>

				<div className="mt-16 grid gap-px bg-white/10 md:grid-cols-2">
					{siteConfig.values.map((value, i) => (
						<motion.div
							key={value.number}
							initial={{opacity: 0, y: 30}}
							animate={isInView ? {opacity: 1, y: 0} : {}}
							transition={{duration: 0.6, delay: i * 0.1 + 0.2}}
							className="bg-charcoal p-10 lg:p-14"
						>
							<span className="font-display text-sm text-accent">{value.number}</span>
							<h3 className="heading-display mt-4 text-2xl text-white">{value.title}</h3>
							<p className="mt-4 text-sm leading-relaxed text-white/50">
								{value.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

function TeamSection() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, {once: true, margin: '-100px'});

	return (
		<section ref={ref} id="team" className="bg-cream py-section-sm lg:py-section">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<motion.p
					initial={{opacity: 0, y: 20}}
					animate={isInView ? {opacity: 1, y: 0} : {}}
					transition={{duration: 0.6}}
					className="text-xs font-semibold uppercase tracking-[0.3em] text-accent"
				>
					The Artists
				</motion.p>
				<motion.h2
					initial={{opacity: 0, y: 30}}
					animate={isInView ? {opacity: 1, y: 0} : {}}
					transition={{duration: 0.7, delay: 0.1}}
					className="heading-display mt-4 text-5xl text-charcoal md:text-6xl"
				>
					MEET OUR
					<br/>
					<span className="heading-display-italic text-accent">Team</span>
				</motion.h2>

				<div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
					{siteConfig.team.map((member, i) => (
						<motion.div
							key={member.name}
							initial={{opacity: 0, y: 30}}
							animate={isInView ? {opacity: 1, y: 0} : {}}
							transition={{duration: 0.6, delay: i * 0.1 + 0.2}}
							className="group"
						>
							<div className="aspect-[3/4] overflow-hidden">
								<img src={`/images/${member.image}`}
								     className="image-placeholder h-full w-full transition-transform duration-700 group-hover:scale-105 object-cover"/>
							</div>
							<h3 className="mt-6 font-display text-xl font-semibold text-charcoal">
								{member.name}
							</h3>
							<p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-accent">
								{member.role}
							</p>
							<p className="mt-3 text-sm leading-relaxed text-warm-gray">
								{member.bio}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

export default function AboutPage() {
	const {about} = siteConfig;

	return (
		<>
			{/* Page hero */}
			<section className="relative bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<motion.p
						initial={{opacity: 0, y: 20}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.6, delay: 0.1}}
						className="text-xs font-semibold uppercase tracking-[0.3em] text-accent"
					>
						{about.heroSubtitle}
					</motion.p>
					<motion.h1
						initial={{opacity: 0, y: 30}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.8, delay: 0.2}}
						className="heading-display mt-4 text-6xl text-charcoal md:text-7xl lg:text-8xl"
					>
						{about.heroHeading.map((line, i) => (
							<span key={i}>
								{line}
								<br/>
							</span>
						))}
						<span className="heading-display-italic text-accent">{about.heroHeadingAccent}</span>
					</motion.h1>
					<motion.p
						initial={{opacity: 0, y: 20}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.6, delay: 0.4}}
						className="mt-8 max-w-xl text-lg leading-relaxed text-warm-gray"
					>
						{about.heroBody}
					</motion.p>
				</div>
			</section>

			<StorySection/>
			<ValuesSection/>
			<TeamSection/>

			{/* Bottom CTA */}
			<section className="bg-white py-20 lg:py-28">
				<div className="mx-auto max-w-[1400px] px-6 text-center lg:px-10">
					<h2 className="heading-display text-4xl text-charcoal md:text-5xl">
						{about.bottomCta}
					</h2>
					<p className="mx-auto mt-4 max-w-md text-base text-warm-gray">
						{about.bottomCtaBody}
					</p>
					<div className="mt-8">
						<Link
							href="/services"
							className="inline-flex items-center gap-3 bg-accent px-10 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-charcoal"
						>
							Book Now
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}

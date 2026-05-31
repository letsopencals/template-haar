'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import hero from '@/public/images/hero/hero-cta.jpg';

export function CtaSection() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });
	const { cta } = siteConfig;

	return (
		<section ref={ref} className="relative overflow-hidden bg-cream py-section-sm lg:py-section">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="grid items-center gap-12 lg:grid-cols-2">
					{/* Left — Image */}
					<motion.div
						initial={{ opacity: 0, x: -40 }}
						animate={isInView ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.8 }}
						className="relative"
					>
						<div className="aspect-[4/5] overflow-hidden">
							<img src={hero.src} className="image-placeholder h-full w-full object-cover" />
						</div>
						{/* Orange accent block */}
						<div className="absolute -bottom-6 -right-6 h-32 w-32 bg-accent lg:-bottom-10 lg:-right-10 lg:h-48 lg:w-48" />
					</motion.div>

					{/* Right — Content */}
					<div className="lg:pl-12">
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="text-xs font-semibold uppercase tracking-[0.3em] text-accent"
						>
							{cta.subtitle}
						</motion.p>

						<motion.h2
							initial={{ opacity: 0, y: 30 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.7, delay: 0.3 }}
							className="heading-display mt-6 text-5xl text-charcoal md:text-6xl lg:text-7xl"
						>
							{cta.heading.map((line, i) => (
								<span key={i}>
									{line}
									<br />
								</span>
							))}
							<span className="heading-display-italic text-accent">{cta.headingAccent}</span>
						</motion.h2>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6, delay: 0.5 }}
							className="mt-8 max-w-md text-base leading-relaxed text-warm-gray"
						>
							{cta.body}
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6, delay: 0.7 }}
							className="mt-10 flex flex-wrap gap-8"
						>
							{cta.stats.map((stat) => (
								<div key={stat.label}>
									<span className="font-display text-3xl font-bold text-charcoal">
										{stat.value}
									</span>
									<p className="mt-1 text-xs font-medium uppercase tracking-widest text-warm-gray">
										{stat.label}
									</p>
								</div>
							))}
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6, delay: 0.9 }}
							className="mt-12"
						>
							<Link
								href="/services"
								className="group inline-flex items-center gap-3 bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent"
							>
								Book Your Visit
								<svg
									className="h-4 w-4 transition-transform group-hover:translate-x-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</Link>
						</motion.div>
					</div>
				</div>
			</div>
		</section>
	);
}

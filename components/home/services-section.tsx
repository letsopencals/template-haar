'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import hero from '@/public/images/hero/hero-services.jpg';
import { siteConfig } from '@/lib/site-config';

function ServiceItem({ service, index }: { service: typeof siteConfig.services[0]; index: number }) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });

	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 40 }}
			animate={isInView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.7, delay: index * 0.1 }}
		>
			<Link
				href={service.href}
				className="group flex items-start gap-6 border-b border-white/10 py-8 transition-colors hover:border-accent/50 md:gap-10 md:py-10"
			>
				{/* Number */}
				<span className="font-display text-sm font-light text-accent">
					{String(index + 1).padStart(2, '0')}
				</span>

				{/* Content */}
				<div className="flex-1">
					<div className="flex items-center justify-between">
						<h3 className="heading-display text-2xl text-white transition-colors group-hover:text-accent md:text-3xl lg:text-4xl">
							{service.title}
						</h3>
						<svg
							className="h-5 w-5 -translate-x-2 text-white/30 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
						</svg>
					</div>
					<p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">
						{service.description}
					</p>
				</div>
			</Link>
		</motion.div>
	);
}

export function ServicesSection() {
	const headerRef = useRef<HTMLDivElement>(null);
	const isHeaderInView = useInView(headerRef, { once: true, margin: '-100px' });

	return (
		<section className="noise-overlay relative bg-charcoal py-section-sm lg:py-section">
			<div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10">
				<div className="grid gap-16 lg:grid-cols-12">
					{/* Left — header */}
					<div ref={headerRef} className="lg:col-span-4">
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6 }}
							className="text-xs font-semibold uppercase tracking-[0.3em] text-accent"
						>
							What We Offer
						</motion.p>
						<motion.h2
							initial={{ opacity: 0, y: 30 }}
							animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.7, delay: 0.1 }}
							className="heading-display mt-4 text-5xl text-white md:text-6xl lg:text-7xl"
						>
							OUR
							<br />
							SERV
							<wbr />
							ICES
						</motion.h2>
						<motion.div
							initial={{ opacity: 0, scaleX: 0 }}
							animate={isHeaderInView ? { opacity: 1, scaleX: 1 } : {}}
							transition={{ duration: 0.8, delay: 0.3 }}
							className="mt-6 h-[3px] w-16 origin-left bg-accent"
						/>

						{/* Decorative image */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.8, delay: 0.4 }}
							className="mt-10 hidden aspect-[4/5] w-full overflow-hidden lg:block"
						>
							<img src={hero.src} className="image-placeholder h-full w-full object-cover" />
						</motion.div>
					</div>

					{/* Right — service list */}
					<div className="lg:col-span-8">
						{siteConfig.services.map((service, i) => (
							<ServiceItem key={service.href} service={service} index={i} />
						))}

						{/* View All Link */}
						<motion.div
							initial={{ opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							transition={{ delay: 0.5 }}
							className="mt-10"
						>
							<Link
								href="/services"
								className="group inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:text-accent"
							>
								View All Services
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

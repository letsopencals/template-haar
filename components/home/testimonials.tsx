'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { siteConfig } from '@/lib/site-config';
import hero from '@/public/images/hero/hero-testimonials.jpg';

export function Testimonials() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });
	const [activeIndex, setActiveIndex] = useState(0);
	const { testimonials } = siteConfig;

	return (
		<section id="testimonials" ref={ref} className="noise-overlay relative bg-charcoal py-section-sm lg:py-section">
			<div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10">
				{/* Section header */}
				<div className="flex items-end justify-between">
					<div>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6 }}
							className="text-xs font-semibold uppercase tracking-[0.3em] text-accent"
						>
							Testimonials
						</motion.p>
						<motion.h2
							initial={{ opacity: 0, y: 30 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.7, delay: 0.1 }}
							className="heading-display mt-4 text-5xl text-white md:text-6xl lg:text-7xl"
						>
							CLIENTS
							<br />
							<span className="heading-display-italic text-accent">Feedback</span>
						</motion.h2>
					</div>

					{/* Large decorative quote */}
					<motion.span
						initial={{ opacity: 0, scale: 0.8 }}
						animate={isInView ? { opacity: 0.1, scale: 1 } : {}}
						transition={{ duration: 0.8, delay: 0.3 }}
						className="hidden font-display text-[10rem] leading-none text-white md:block"
					>
						&ldquo;
					</motion.span>
				</div>

				{/* Testimonial content */}
				<div className="mt-16 grid gap-12 lg:grid-cols-12">
					{/* Quote display */}
					<div className="lg:col-span-8">
						<motion.div
							key={activeIndex}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<blockquote className="font-display text-2xl leading-relaxed font-light text-white/90 italic md:text-3xl lg:text-4xl">
								&ldquo;{testimonials[activeIndex]?.quote}&rdquo;
							</blockquote>
							<div className="mt-8 flex items-center gap-4">
								<div className="h-[1px] w-12 bg-accent" />
								<div>
									<p className="text-sm font-semibold text-white">
										{testimonials[activeIndex]?.author}
									</p>
									<p className="mt-1 text-xs text-white/50">
										{testimonials[activeIndex]?.role}
									</p>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Navigation dots + image */}
					<div className="flex flex-col items-end justify-between lg:col-span-4">
						<div className="aspect-[3/4] w-full overflow-hidden">
							<img src={hero.src} className="image-placeholder h-full w-full object-cover" />
						</div>

						{/* Dots */}
						<div className="mt-8 flex gap-3">
							{testimonials.map((_, i) => (
								<button
									key={i}
									onClick={() => setActiveIndex(i)}
									className={`h-2 transition-all duration-300 ${
										i === activeIndex
											? 'w-8 bg-accent'
											: 'w-2 bg-white/30 hover:bg-white/50'
									}`}
									aria-label={`Go to testimonial ${i + 1}`}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

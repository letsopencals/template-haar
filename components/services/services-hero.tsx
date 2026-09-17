'use client';

import { motion } from 'framer-motion';
import { LocationFilter } from './location-filter';

const EYEBROW_INITIAL = { opacity: 0, y: 20 };
const EYEBROW_ANIMATE = { opacity: 1, y: 0 };

export function ServicesHero() {
	return (
		<section id="services-hero" className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				<motion.p
					initial={EYEBROW_INITIAL}
					animate={EYEBROW_ANIMATE}
					transition={{ duration: 0.6, delay: 0.1 }}
					className="text-xs font-semibold uppercase tracking-[0.3em] text-accent"
				>
					What We Offer
				</motion.p>
				<motion.h1
					initial={{ opacity: 0, y: 30 }}
					animate={EYEBROW_ANIMATE}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="heading-display mt-4 text-6xl text-charcoal md:text-7xl lg:text-8xl"
				>
					OUR
					<br />
					<span className="heading-display-italic text-accent">Services</span>
				</motion.h1>
				<motion.p
					initial={EYEBROW_INITIAL}
					animate={EYEBROW_ANIMATE}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mt-8 max-w-xl text-lg leading-relaxed text-warm-gray"
				>
					Every service is a tailored experience, combining technical mastery
					with creative artistry to deliver exceptional results.
				</motion.p>

				<LocationFilter />
			</div>
		</section>
	);
}

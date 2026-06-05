'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

export function BookingBanner() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-100px' });
	const { bookingBanner } = siteConfig;

	return (
		<section id="booking" ref={ref} className="relative overflow-hidden bg-accent py-20 lg:py-28">
			{/* Background pattern */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border-[40px] border-white" />
				<div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full border-[30px] border-white" />
			</div>

			<div className="relative z-10 mx-auto max-w-[1400px] px-6 text-center lg:px-10">
				<motion.h2
					initial={{ opacity: 0, y: 30 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.7 }}
					className="heading-display text-4xl text-white md:text-6xl lg:text-7xl"
				>
					{bookingBanner.heading.map((line, i) => (
						<span key={i}>
							{line}
							<br />
						</span>
					))}
					<span className="heading-display-italic">{bookingBanner.headingAccent}</span>
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="mx-auto mt-6 max-w-lg text-base text-white/80"
				>
					{bookingBanner.body}
				</motion.p>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={isInView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6, delay: 0.4 }}
					className="mt-10"
				>
					<Link
						href="/services"
						className="inline-flex items-center gap-3 bg-white px-10 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition-all hover:bg-charcoal hover:text-white"
					>
						Book Appointment
						<svg
							className="h-4 w-4"
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
		</section>
	);
}

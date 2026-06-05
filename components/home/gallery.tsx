'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import balayage from '@/public/images/gallery/balayage.jpg';
import precisionCut from '@/public/images/gallery/precision-cut.jpg';
import keratinShine from '@/public/images/gallery/keratin-shine.jpg';
import colorArt from '@/public/images/gallery/color-art.jpg';
import bridalUpdo from '@/public/images/gallery/bridal-updo.jpg';
import naturalTexture from '@/public/images/gallery/natural-texture.jpg';

const galleryItems = [
	{ aspect: 'aspect-[3/4]', label: 'Balayage Transformation', image: balayage },
	{ aspect: 'aspect-square', label: 'Precision Cut', image: precisionCut },
	{ aspect: 'aspect-[4/5]', label: 'Keratin Shine', image: keratinShine },
	{ aspect: 'aspect-[3/4]', label: 'Color Art', image: colorArt },
	{ aspect: 'aspect-square', label: 'Bridal Updo', image: bridalUpdo },
	{ aspect: 'aspect-[4/5]', label: 'Natural Texture', image: naturalTexture },
];

export function Gallery() {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, margin: '-50px' });

	return (
		<section id="gallery" ref={ref} className="bg-white py-section-sm lg:py-section">
			<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
				{/* Header */}
				<div className="flex items-end justify-between">
					<div>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6 }}
							className="text-xs font-semibold uppercase tracking-[0.3em] text-accent"
						>
							Our Work
						</motion.p>
						<motion.h2
							initial={{ opacity: 0, y: 30 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.7, delay: 0.1 }}
							className="heading-display mt-4 text-5xl text-charcoal md:text-6xl"
						>
							STYLE
							<br />
							<span className="heading-display-italic text-accent">Gallery</span>
						</motion.h2>
					</div>
					<motion.a
						initial={{ opacity: 0 }}
						animate={isInView ? { opacity: 1 } : {}}
						transition={{ delay: 0.4 }}
						href="#"
						className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:text-accent md:inline-flex md:items-center md:gap-2"
					>
						@haar.salon
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
						</svg>
					</motion.a>
				</div>

				{/* Masonry grid */}
				<div className="mt-12 columns-2 gap-4 md:columns-3">
					{galleryItems.map((item, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 30 }}
							animate={isInView ? { opacity: 1, y: 0 } : {}}
							transition={{ duration: 0.6, delay: i * 0.1 }}
							className="group mb-4 cursor-pointer overflow-hidden break-inside-avoid"
						>
							<div className={`${item.aspect} relative overflow-hidden`}>
								<img src={item.image.src} className="image-placeholder h-full w-full transition-transform duration-700 group-hover:scale-105 object-cover" />
								{/* Overlay on hover */}
								<div className="absolute inset-0 flex items-end bg-gradient-to-t from-charcoal/60 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
									<p className="text-sm font-medium text-white">{item.label}</p>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

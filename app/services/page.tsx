'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import type { ProductListItemResponse as Product } from '@opencals/storefront-sdk';
import { formatDuration, formatPrice, getProductImage } from '@/lib/format';
import { useLocation } from '@/contexts/location-context';
import { useSettings } from '@/contexts/settings-context';
import { StaffAvatars } from '@/components/ui/staff-avatars';

function ServiceCard({product, index}: { product: Product; index: number }) {
	const { currency } = useSettings();
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, {once: true, margin: '-80px'});
	const isEven = index % 2 === 0;
	const variants = product.variants ?? [];
	const imageUrl = getProductImage(variants[0]);
	const hasMultipleVariants = variants.length > 1;

	return (
		<motion.div
			ref={ref}
			initial={{opacity: 0, y: 40}}
			animate={isInView ? {opacity: 1, y: 0} : {}}
			transition={{duration: 0.7}}
			className="grid gap-12 border-b border-charcoal/10 py-16 lg:grid-cols-2 lg:py-24"
		>
			{/* Info side */}
			<div className={isEven ? '' : 'lg:order-2'}>
				<span className="font-display text-sm text-accent">
					{String(index + 1).padStart(2, '0')}
				</span>
				<h2 className="heading-display mt-3 text-4xl text-charcoal md:text-5xl">
					{product.title}
				</h2>
				{product.description && (
					<p className="mt-4 max-w-md text-base leading-relaxed text-warm-gray">
						{product.description}
					</p>
				)}

				{/* Variants or single service details */}
				{hasMultipleVariants ? (
					<div className="mt-8 space-y-3">
						{variants.map((variant) => (
							<Link
								key={variant.id}
								href={`/booking/${variant.slug}`}
								className="group flex items-center justify-between border border-charcoal/10 p-4 transition-all hover:border-charcoal/30 hover:bg-cream/30"
							>
								<div>
									<p className="text-sm font-medium text-charcoal">{variant.variantTitle}</p>
									<div className="mt-1 flex items-center gap-3">
										<span
											className="text-xs text-warm-gray">{formatDuration(variant.duration)}</span>
										{variant.staffMembers && variant.staffMembers.length > 0 && (
											<StaffAvatars staffMembers={variant.staffMembers} maxVisible={4} size="sm"/>
										)}
									</div>
								</div>
								<div className="flex items-center gap-4">
									<span className="text-sm font-semibold text-charcoal">
										{formatPrice(variant.price, currency)}
									</span>
									<svg
										className="h-4 w-4 text-warm-gray transition-transform group-hover:translate-x-1 group-hover:text-accent"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={2}
									>
										<path strokeLinecap="round" strokeLinejoin="round"
										      d="M17 8l4 4m0 0l-4 4m4-4H3"/>
									</svg>
								</div>
							</Link>
						))}
					</div>
				) : (
					<>
						<div className="mt-8 space-y-0">
							<div className="flex items-center justify-between border-b border-cream-dark py-4">
								<span className="text-sm font-medium text-charcoal">Duration</span>
								<span className="text-sm font-semibold text-charcoal">
									{formatDuration(variants[0]?.duration ?? product.duration)}
								</span>
							</div>
							<div className="flex items-center justify-between border-b border-cream-dark py-4">
								<span className="text-sm font-medium text-charcoal">Price</span>
								<span className="text-sm font-semibold text-charcoal">
									{formatPrice(variants[0]?.price ?? product.price, currency)}
								</span>
							</div>
							{product.maxAttendees > 1 && (
								<div className="flex items-center justify-between border-b border-cream-dark py-4">
									<span className="text-sm font-medium text-charcoal">Max Attendees</span>
									<span className="text-sm font-semibold text-charcoal">
										{product.maxAttendees}
									</span>
								</div>
							)}
						</div>

						{/* Staff avatars */}
						{(() => {
							const staffList = variants[0]?.staffMembers;
							return staffList && staffList.length > 0 ? (
								<div className="mt-6">
									<StaffAvatars staffMembers={staffList} maxVisible={5} size="md"/>
								</div>
							) : null;
						})()}

						<Link
							href={`/booking/${variants[0]?.slug ?? product.slug}`}
							className="group mt-8 inline-flex items-center gap-3 bg-charcoal px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent"
						>
							Book Now
							<svg
								className="h-4 w-4 transition-transform group-hover:translate-x-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
							</svg>
						</Link>
					</>
				)}
			</div>

			{/* Image side */}
			<div className={`aspect-[4/5] overflow-hidden ${isEven ? 'lg:order-2' : ''}`}>
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={product.title ?? 'Service'}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="image-placeholder h-full w-full"/>
				)}
			</div>
		</motion.div>
	);
}

function ServiceCardSkeleton({index}: { index: number }) {
	const isEven = index % 2 === 0;
	return (
		<div className="grid gap-12 border-b border-charcoal/10 py-16 lg:grid-cols-2 lg:py-24">
			<div className={isEven ? '' : 'lg:order-2'}>
				<div className="h-4 w-8 rounded bg-cream-dark animate-pulse"/>
				<div className="mt-3 h-12 w-64 rounded bg-cream-dark animate-pulse"/>
				<div className="mt-4 space-y-2">
					<div className="h-4 w-full max-w-md rounded bg-cream-dark animate-pulse"/>
					<div className="h-4 w-3/4 max-w-md rounded bg-cream-dark animate-pulse"/>
				</div>
				<div className="mt-8 space-y-0">
					{[1, 2].map((i) => (
						<div key={i} className="flex items-center justify-between border-b border-cream-dark py-4">
							<div className="h-4 w-20 rounded bg-cream-dark animate-pulse"/>
							<div className="h-4 w-16 rounded bg-cream-dark animate-pulse"/>
						</div>
					))}
				</div>
				<div className="mt-8 h-12 w-40 rounded bg-cream-dark animate-pulse"/>
			</div>
			<div className={`aspect-[4/5] overflow-hidden ${isEven ? 'lg:order-2' : ''}`}>
				<div className="image-placeholder h-full w-full animate-pulse"/>
			</div>
		</div>
	);
}

function LocationFilter() {
	const {locations, selectedLocationId, setSelectedLocationId, loading: locationsLoading} = useLocation();

	if (locationsLoading || locations.length <= 1) return null;

	return (
		<motion.div
			initial={{opacity: 0, y: 10}}
			animate={{opacity: 1, y: 0}}
			transition={{duration: 0.5, delay: 0.5}}
			className="mt-10"
		>
			<div className="flex flex-wrap items-center gap-3">
				<button
					onClick={() => setSelectedLocationId(null)}
					className={`border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all ${
						selectedLocationId === null
							? 'border-charcoal bg-charcoal text-white'
							: 'border-charcoal/10 text-charcoal hover:border-charcoal/30'
					}`}
				>
					All Locations
				</button>
				{locations.map((location) => (
					<button
						key={location.id}
						onClick={() => setSelectedLocationId(location.id)}
						className={`border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] transition-all ${
							selectedLocationId === location.id
								? 'border-charcoal bg-charcoal text-white'
								: 'border-charcoal/10 text-charcoal hover:border-charcoal/30'
						}`}
					>
						{location.title ?? 'Location'}
					</button>
				))}
			</div>
		</motion.div>
	);
}

export default function ServicesPage() {
	const {selectedLocationId, setSelectedLocationId} = useLocation();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchProducts() {
			setLoading(true);
			setError(null);
			try {
				const params = new URLSearchParams();
				if (selectedLocationId) params.set('locationId', selectedLocationId);
				const res = await fetch(`/api/products?${params}`);
				if (!res.ok) {
					if (selectedLocationId && res.status === 400) {
						setSelectedLocationId(null);
						return;
					}
					throw new Error('Failed to fetch');
				}
				const data = await res.json();
				setProducts(data.data ?? []);
			} catch {
				setError('Unable to load services. Please try again later.');
			} finally {
				setLoading(false);
			}
		}

		fetchProducts();
	}, [selectedLocationId, setSelectedLocationId]);

	return (
		<>
			{/* Hero */}
			<section id="services-hero" className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-28">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<motion.p
						initial={{opacity: 0, y: 20}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.6, delay: 0.1}}
						className="text-xs font-semibold uppercase tracking-[0.3em] text-accent"
					>
						What We Offer
					</motion.p>
					<motion.h1
						initial={{opacity: 0, y: 30}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.8, delay: 0.2}}
						className="heading-display mt-4 text-6xl text-charcoal md:text-7xl lg:text-8xl"
					>
						OUR
						<br/>
						<span className="heading-display-italic text-accent">Services</span>
					</motion.h1>
					<motion.p
						initial={{opacity: 0, y: 20}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.6, delay: 0.4}}
						className="mt-8 max-w-xl text-lg leading-relaxed text-warm-gray"
					>
						Every service is a tailored experience, combining technical mastery
						with creative artistry to deliver exceptional results.
					</motion.p>

					<LocationFilter/>
				</div>
			</section>

			{/* Service list */}
			<section id="services-list" className="bg-white pb-20 lg:pb-32">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					{loading && (
						<>
							{[0, 1, 2].map((i) => (
								<ServiceCardSkeleton key={i} index={i}/>
							))}
						</>
					)}

					{error && (
						<div className="py-20 text-center">
							<p className="text-warm-gray">{error}</p>
						</div>
					)}

					{!loading && !error && products.length === 0 && (
						<div className="py-20 text-center">
							<p className="text-warm-gray">No services available at the moment.</p>
						</div>
					)}

					{products.map((product, i) => (
						<ServiceCard key={product.id} product={product} index={i}/>
					))}
				</div>
			</section>

			{/* Bottom CTA */}
			<section id="services-cta" className="bg-accent py-20">
				<div className="mx-auto max-w-[1400px] px-6 text-center lg:px-10">
					<h2 className="heading-display text-4xl text-white md:text-5xl">
						NOT SURE WHICH SERVICE?
					</h2>
					<p className="mx-auto mt-4 max-w-md text-base text-white/80">
						Book a free consultation and our experts will recommend the perfect
						treatment for your hair.
					</p>
					<div className="mt-8">
						<Link
							href="/contact"
							className="inline-flex items-center gap-3 bg-white px-10 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition-all hover:bg-charcoal hover:text-white"
						>
							Contact Us
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}

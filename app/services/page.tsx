import Link from 'next/link';
import { getProducts } from '@/lib/server-data';
import { ServicesHero } from '@/components/services/services-hero';
import { ServicesList } from '@/components/services/services-list';

// Server Component: products for the default (all-locations) view are fetched
// on the server and passed to <ServicesList> as SWR fallbackData, so the list
// paints immediately. Location filtering happens client-side via SWR.
export default async function ServicesPage() {
	const products = await getProducts();

	return (
		<>
			<ServicesHero />

			{/* Service list */}
			<section id="services-list" className="bg-white pb-20 lg:pb-32">
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<ServicesList initialProducts={products} />
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

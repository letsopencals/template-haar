import Link from 'next/link';
import { getProducts, getStoreSettings } from '@/lib/server-data';
import { formatPrice } from '@/lib/format';
import { buttonClasses } from '@/components/ui/button';
import { ServicesHero } from '@/components/services/services-hero';
import { ServicesList } from '@/components/services/services-list';
import { fromPrice } from '@/components/services/menu-utils';

// Server Component: products for the "All salons" view are fetched on the
// server and seed <ServicesList> as SWR fallbackData, so The Menu paints
// immediately. Salon filtering happens client-side via SWR.
export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ staff?: string }> }) {
	const [{ staff }, products, settings] = await Promise.all([searchParams, getProducts(), getStoreSettings()]);
	const lowest = products.length ? Math.min(...products.map(fromPrice)) : null;

	return (
		<>
			<ServicesHero count={products.length} fromLabel={lowest !== null ? formatPrice(lowest, settings?.currency ?? 'USD') : null} />

			<section id="services-list" className="bg-paper pt-6 pb-24 lg:pb-36">
				<div className="container-x">
					<ServicesList initialProducts={products} staffId={typeof staff === 'string' && staff ? staff : null} />
				</div>
			</section>

			<section id="services-cta" className="grain bg-charcoal py-24 text-cream lg:py-32">
				<div className="container-x grid gap-10 lg:grid-cols-12 lg:items-end">
					<div className="lg:col-span-8">
						<span className="eyebrow text-brass-light">Not sure where to begin?</span>
						<h2 className="display-lg mt-6">
							Start with a <em className="text-accent">conversation.</em>
						</h2>
					</div>
					<div className="lg:col-span-4">
						<p className="max-w-[40ch] text-[17px] leading-[1.7] text-cream/70">
							Tell us about your hair and what you&rsquo;d love it to do. We&rsquo;ll suggest the right service and the right
							chair.
						</p>
						<Link href="/contact" className={buttonClasses({ variant: 'inverse', size: 'lg', className: 'mt-8' })}>
							Write to the salon
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}

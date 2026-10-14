import { ContactHero } from '@/components/contact/contact-hero';
import { SalonCards } from '@/components/contact/salon-cards';
import { Timetable } from '@/components/contact/timetable';
import { MapCard } from '@/components/contact/map-card';
import { ContactForm } from '@/components/contact/contact-form';
import { Reveal } from '@/components/motion/reveal';
import { getPhysicalLocations } from '@/lib/server-data';

export default async function ContactPage() {
	const locations = await getPhysicalLocations();

	return (
		<>
			<ContactHero />
			<section className="section-y border-t border-line bg-paper">
				<div className="container-x grid gap-16 lg:grid-cols-12">
					<div className="space-y-16 lg:col-span-7">
						<div>
							<h2 className="eyebrow mb-6 text-warm-gray">
								<span className="tabular">Nº 02</span> — The salons
							</h2>
							<SalonCards locations={locations} />
						</div>
						<Reveal>
							<MapCard locations={locations} />
						</Reveal>
						<div>
							<h2 className="eyebrow mb-4 text-warm-gray">Hours, every salon</h2>
							<Timetable />
						</div>
					</div>
					<div className="lg:col-span-5">
						<div className="lg:sticky lg:top-24">
							<ContactForm />
						</div>
					</div>
				</div>
			</section>
		</>
	);
}

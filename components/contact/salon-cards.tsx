import { Reveal } from '@/components/motion/reveal';
import type { PublicLocation } from '@/lib/server-data';
import { siteConfig } from '@/lib/site-config';

/** One card per physical salon from the API; falls back to the configured address. */
export function SalonCards({ locations }: { locations: PublicLocation[] }) {
	const cards: PublicLocation[] =
		locations.length > 0 ? locations : [{ id: 'default', title: siteConfig.name, addressLines: siteConfig.contact.address.split('\n') }];
	return (
		<ul className="grid gap-px border border-line bg-line sm:grid-cols-2">
			{cards.map((loc, i) => (
				<Reveal as="li" key={loc.id} delay={i * 0.06} className="group flex flex-col bg-paper p-7 md:p-8">
					<span className="tabular text-xs text-brass">Salon {String(i + 1).padStart(2, '0')}</span>
					<h3 className="mt-4 font-display text-2xl leading-tight tracking-[-0.02em] text-charcoal transition-colors duration-500 group-hover:text-accent">
						{loc.title}
					</h3>
					<address className="mt-3 text-[15px] not-italic leading-relaxed text-charcoal/70">
						{loc.addressLines.map((line) => (
							<span key={line} className="block">
								{line}
							</span>
						))}
					</address>
					<a
						href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([loc.title, ...loc.addressLines].join(', '))}`}
						target="_blank"
						rel="noopener noreferrer"
						className="link-underline eyebrow mt-6 w-fit text-charcoal"
					>
						Directions <span aria-hidden>↗</span>
						<span className="sr-only"> to {loc.title} (opens in a new tab)</span>
					</a>
				</Reveal>
			))}
		</ul>
	);
}

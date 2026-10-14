import Link from 'next/link';
import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from '@/components/home/section-heading';
import { StylistCard } from '@/components/home/the-chairs';
import type { PublicStylist } from '@/lib/server-data';

/** Every stylist from the API. Keeps `id="team"` (iframe scroll target, footer "Our Team" link). */
export function Team({ stylists }: { stylists: PublicStylist[] }) {
	return (
		<section id="team" className="section-y scroll-mt-20 bg-cream">
			<div className="container-x">
				<SectionHeading number="04" label="The artists" title="Every chair," accent="every hand">
					<Reveal>
						<p className="max-w-sm text-[15px] leading-relaxed text-charcoal/70">
							Choose a stylist to see the services they offer and their next free chair.
						</p>
					</Reveal>
				</SectionHeading>
				{stylists.length > 0 ? (
					<ul className="mt-16 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-y-16">
						{stylists.map((s, i) => (
							<StylistCard key={s.id} stylist={s} index={i} layout="grid" />
						))}
					</ul>
				) : (
					<p className="mt-16 text-warm-gray">
						Our team is being introduced.{' '}
						<Link href="/services" className="link-underline text-charcoal">
							Browse the menu
						</Link>{' '}
						in the meantime.
					</p>
				)}
			</div>
		</section>
	);
}

import { Marquee } from '@/components/motion/marquee';

const WORDS = ['Cut', 'Colour', 'Balayage', 'Keratin', 'Blow-dry', 'Bridal', 'Scalp ritual', 'Colour correction'] as const;

/** Nº 01½ — the one ticker on the page: services set in alternating roman / italic, brass asterisms between. */
export function Ticker() {
	return (
		<section aria-label="What we do" className="border-y border-line bg-cream py-5 md:py-7">
			<Marquee duration={46} gapClassName="gap-10 md:gap-14">
				{WORDS.map((w, i) => (
					<span key={w} className="flex items-center gap-10 whitespace-nowrap md:gap-14">
						<span className={i % 2 ? 'font-display text-3xl italic text-charcoal md:text-5xl' : 'font-display text-3xl text-charcoal md:text-5xl'}>
							{w}
						</span>
						<span aria-hidden className="font-display text-xl text-brass md:text-2xl">
							⁂
						</span>
					</span>
				))}
			</Marquee>
		</section>
	);
}

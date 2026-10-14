import { RevealText, Reveal } from '@/components/motion/reveal';
import { ScissorRule } from '@/components/motifs/scissor-rule';
import { LocationFilter } from './location-filter';

interface ServicesHeroProps {
	count: number;
	/** Pre-formatted lowest price, e.g. "$40". */
	fromLabel: string | null;
}

/** "Nº 02 — The Menu" masthead: folio rule, display headline, standfirst and the salon tabs. */
export function ServicesHero({ count, fromLabel }: ServicesHeroProps) {
	return (
		<section id="services-hero" className="grain bg-paper pt-32 pb-10 lg:pt-44 lg:pb-14">
			<div className="container-x">
				<Reveal className="flex items-center justify-between gap-6 border-b border-line pb-4">
					<span className="eyebrow text-warm-gray">Nº 02 — The Menu</span>
					<span className="eyebrow tabular hidden text-warm-gray sm:inline">
						{count} {count === 1 ? 'service' : 'services'}
						{fromLabel ? ` · from ${fromLabel}` : ''}
					</span>
				</Reveal>

				<div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:items-end">
					<h1 className="display-xl text-charcoal lg:col-span-8">
						<RevealText as="span" text="The" trigger="mount" lineClassName="pb-[0.06em]" />
						<RevealText
							as="span"
							text="Menu."
							trigger="mount"
							delay={0.12}
							className="italic-display -mt-[0.06em] block pl-[0.6em] text-accent"
							lineClassName="pb-[0.12em]"
						/>
					</h1>
					<Reveal delay={0.3} className="lg:col-span-4 lg:pb-6">
						<p className="max-w-[40ch] text-[17px] leading-[1.7] text-warm-gray">
							Every appointment begins with a conversation. Choose a service, then the option, the chair and the
							hour — we&rsquo;ll do the rest by hand.
						</p>
					</Reveal>
				</div>

				<div className="mt-12">
					<LocationFilter />
				</div>
				<ScissorRule className="mt-2" />
			</div>
		</section>
	);
}

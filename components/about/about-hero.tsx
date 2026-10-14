import Image from 'next/image';
import { RevealText, Reveal } from '@/components/motion/reveal';
import { RevealArch } from '@/components/motion/reveal-arch';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { siteConfig } from '@/lib/site-config';
import mainImage from '@/public/images/about/main.jpg';

/** "WHERE ART", "MEETS" → "Where art meets" (the config is written in caps for the old design). */
function sentenceCase(parts: readonly string[]): string {
	const text = parts.join(' ').toLowerCase();
	return text.charAt(0).toUpperCase() + text.slice(1);
}

/** About opener: long-read title, standfirst and the lead arch plate (LCP). */
export function AboutHero() {
	const { heroSubtitle, heroHeading, heroHeadingAccent, heroBody } = siteConfig.about;
	return (
		<section className="overflow-hidden bg-paper pb-20 pt-32 md:pb-28 md:pt-40">
			<div className="container-x grid items-end gap-14 lg:grid-cols-12">
				<div className="lg:col-span-7">
					<span className="eyebrow text-warm-gray">
						<span className="tabular">Nº 01</span> — {heroSubtitle}
					</span>
					<h1 className="display-xl mt-6 text-charcoal">
						<RevealText as="span" className="block" lineClassName="pb-[0.06em]" text={sentenceCase(heroHeading)} trigger="mount" />
						<RevealText
							as="span"
							className="block pl-[0.6em] text-accent"
							lineClassName="pb-[0.14em] font-display italic"
							text={heroHeadingAccent.charAt(0).toUpperCase() + heroHeadingAccent.slice(1).toLowerCase()}
							delay={0.12}
							trigger="mount"
						/>
					</h1>
					<Reveal delay={0.25}>
						<p className="mt-10 max-w-xl border-l border-brass pl-6 font-display text-xl italic leading-[1.5] text-charcoal/80 md:text-2xl">
							{heroBody}
						</p>
						<p className="eyebrow mt-8 flex flex-wrap gap-x-6 gap-y-2 text-warm-gray">
							<span>Words by the House</span>
							<span className="tabular">Est. 2009</span>
							<span>6 min read</span>
						</p>
					</Reveal>
				</div>
				<figure className="relative mx-auto w-full max-w-[26rem] lg:col-span-4 lg:col-start-9">
					<ArchOutline className="absolute -right-4 -top-4 h-full w-full" />
					<RevealArch trigger="mount" delay={0.1} className="aspect-[3/4] w-full">
						<Image
							src={mainImage}
							alt="Inside the HAAR salon"
							fill
							priority
							placeholder="blur"
							sizes="(min-width: 1024px) 416px, 92vw"
							className="object-cover object-[45%_50%]"
						/>
					</RevealArch>
					<figcaption className="mt-3 flex justify-between border-t border-line pt-2 text-[0.72rem] text-warm-gray">
						<span className="tabular text-brass">Pl. 01</span>
						<span className="italic-display">The salon floor, morning light</span>
					</figcaption>
				</figure>
			</div>
		</section>
	);
}

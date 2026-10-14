import Image from 'next/image';
import { Reveal } from '@/components/motion/reveal';
import { RevealArch } from '@/components/motion/reveal-arch';
import { ScissorRule } from '@/components/motifs/scissor-rule';
import { siteConfig } from '@/lib/site-config';
import secondaryImage from '@/public/images/about/secondary.jpg';

/** The long-read: drop-cap opening paragraph, a pull quote, and an offset plate. */
export function Story() {
	const [first, ...rest] = siteConfig.about.storyParagraphs;
	return (
		<section className="section-y bg-paper">
			<div className="container-x grid gap-16 lg:grid-cols-12">
				<aside className="lg:col-span-4">
					<div className="lg:sticky lg:top-28">
						<span className="eyebrow text-warm-gray">
							<span className="tabular">Nº 02</span> — Our story
						</span>
						<figure className="mt-10 w-full max-w-[20rem]">
							<RevealArch className="aspect-[4/5] w-full">
								<Image
									src={secondaryImage}
									alt="A stylist finishing a cut"
									fill
									placeholder="blur"
									sizes="(min-width: 1024px) 320px, 80vw"
									className="object-cover object-[55%_50%]"
								/>
							</RevealArch>
							<figcaption className="mt-3 flex justify-between border-t border-line pt-2 text-[0.72rem] text-warm-gray">
								<span className="tabular text-brass">Pl. 02</span>
								<span className="italic-display">At the chair</span>
							</figcaption>
						</figure>
					</div>
				</aside>
				<div className="lg:col-span-7 lg:col-start-6">
					<Reveal>
						<p className="drop-cap text-[18px] leading-[1.8] text-charcoal/85 md:text-[19px]">{first}</p>
					</Reveal>
					<Reveal>
						<blockquote className="my-14 border-y border-line py-10">
							<p className="font-display text-3xl italic leading-[1.2] tracking-[-0.02em] text-charcoal md:text-4xl">
								&ldquo;A salon visit should be more than a routine. It should <span className="text-accent">change how you walk out the door.</span>&rdquo;
							</p>
							<footer className="eyebrow mt-6 text-warm-gray">Victoria Lane, founder</footer>
						</blockquote>
					</Reveal>
					<div className="space-y-6 text-[17px] leading-[1.8] text-charcoal/75">
						{rest.map((p) => (
							<Reveal key={p.slice(0, 24)}>
								<p>{p}</p>
							</Reveal>
						))}
					</div>
					<ScissorRule className="mt-14" />
				</div>
			</div>
		</section>
	);
}

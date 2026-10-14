import { Reveal } from '@/components/motion/reveal';
import { SectionHeading } from '@/components/home/section-heading';
import { siteConfig } from '@/lib/site-config';

/** Values as a numbered manifesto on a charcoal spread. */
export function Manifesto() {
	return (
		<section className="grain section-y overflow-hidden bg-charcoal text-white">
			<div className="container-x relative z-[2]">
				<SectionHeading number="03" label="What drives us" title="A short" accent="manifesto" tone="dark" size="md" />
				<ol className="mt-16 border-t border-white/15">
					{siteConfig.values.map((value, i) => (
						<Reveal as="li" key={value.number} delay={i * 0.06} className="group grid gap-4 border-b border-white/15 py-10 md:grid-cols-12 md:items-baseline md:gap-8 md:py-12">
							<span className="tabular text-sm text-brass-light md:col-span-1">{value.number}</span>
							<h3 className="font-display text-[clamp(2rem,4.4vw,3.75rem)] leading-[1] tracking-[-0.03em] transition-colors duration-500 group-hover:text-accent md:col-span-6">
								{value.title}
							</h3>
							<p className="max-w-md text-[15px] leading-[1.7] text-white/60 md:col-span-5">{value.description}</p>
						</Reveal>
					))}
				</ol>
			</div>
		</section>
	);
}

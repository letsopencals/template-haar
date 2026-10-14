import Link from 'next/link';
import { CountUp } from '@/components/motion/count-up';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { ParallaxImage } from '@/components/motion/parallax-image';
import { Reveal, RevealText } from '@/components/motion/reveal';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { Seal } from '@/components/motifs/seal';
import { buttonClasses } from '@/components/ui/button';

export interface SpreadStat {
	value: number;
	suffix?: string;
	label: string;
}

/**
 * Nº 07 — the closing charcoal spread: counted-up house figures, then the
 * booking banner with the page's one magnetic CTA.
 */
export function Spread({ stats }: { stats: SpreadStat[] }) {
	return (
		<section id="booking" className="grain overflow-hidden bg-charcoal text-white">
			<div className="container-x relative z-[2] pb-24 pt-20 md:pb-36 md:pt-28">
				<span className="eyebrow text-brass-light">
					<span className="tabular">Nº 07</span> — By the numbers
				</span>
				<dl className="mt-10 grid grid-cols-2 border-t border-white/15 md:grid-cols-4">
					{stats.map((s, i) => (
						<Reveal key={s.label} delay={i * 0.08} className="border-b border-white/15 py-8 pr-4 even:pl-5 md:border-b-0 md:border-r md:px-6 md:py-10 md:first:pl-0 md:last:border-r-0 md:even:pl-6">
							<dt className="sr-only">{s.label}</dt>
							<dd>
								<CountUp value={s.value} suffix={s.suffix} className="block text-5xl text-white md:text-7xl" />
								<span className="mt-3 block text-[0.8rem] text-white/55">{s.label}</span>
							</dd>
						</Reveal>
					))}
				</dl>

				<div className="mt-24 grid items-end gap-16 md:mt-32 lg:grid-cols-12">
					<div className="lg:col-span-7">
						<h2 className="display-lg text-white">
							<RevealText as="span" className="block" lineClassName="pb-[0.06em]" text="Ready for a" />
							<RevealText as="span" className="block pl-[0.8em] text-accent" lineClassName="pb-[0.14em] font-display italic" text="new look?" delay={0.12} />
						</h2>
						<Reveal delay={0.2}>
							<p className="mt-8 max-w-md text-[17px] leading-[1.7] text-white/65">
								Choose a service, a stylist and a time. Your chair is held while you finish booking.
							</p>
							<div className="mt-10 flex flex-wrap items-center gap-8">
								<MagneticButton>
									<Link href="/services" className={buttonClasses({ variant: 'inverse', size: 'lg' })}>
										Reserve your chair <span aria-hidden>→</span>
									</Link>
								</MagneticButton>
								<Link href="/contact" className="link-underline eyebrow text-white/80 hover:text-white">
									Or write to us
								</Link>
							</div>
						</Reveal>
					</div>

					<figure className="relative mx-auto w-full max-w-[20rem] lg:col-span-4 lg:col-start-9">
						<ArchOutline className="absolute -left-4 -top-4 h-full w-full" strokeClassName="stroke-brass-light/60" />
						<ParallaxImage
							src="/images/hero/hero-cta.jpg"
							alt="Flowing, freshly finished hair"
							className="arch aspect-[3/4] w-full"
							sizes="320px"
							imageClassName="object-[40%_50%]"
						/>
						<div className="absolute -bottom-10 -right-6">
							<Seal motion="spin" size={112} ring="Reserve your chair · HAAR · " className="text-brass-light" />
						</div>
					</figure>
				</div>
			</div>
		</section>
	);
}

import Link from 'next/link';
import { MagneticButton } from '@/components/motion/magnetic-button';
import { Reveal, RevealText } from '@/components/motion/reveal';
import { Seal } from '@/components/motifs/seal';
import { buttonClasses } from '@/components/ui/button';
import { siteConfig } from '@/lib/site-config';

/** Closing invitation at the end of the long-read. */
export function ClosingCta() {
	return (
		<section className="section-y bg-paper">
			<div className="container-x flex flex-col items-center text-center">
				<Seal motion="spin" size={104} className="text-brass" />
				<h2 className="display-lg mt-10 text-charcoal">
					<RevealText as="span" className="block" lineClassName="pb-[0.06em]" text="Ready to experience" />
					<RevealText as="span" className="block text-accent" lineClassName="pb-[0.14em] font-display italic" text={`${siteConfig.name}?`} delay={0.12} />
				</h2>
				<Reveal delay={0.2}>
					<p className="mx-auto mt-8 max-w-md text-[17px] leading-[1.7] text-charcoal/70">{siteConfig.about.bottomCtaBody}</p>
					<div className="mt-10 flex flex-wrap items-center justify-center gap-8">
						<MagneticButton>
							<Link href="/services" className={buttonClasses({ size: 'lg' })}>
								Reserve your chair <span aria-hidden>→</span>
							</Link>
						</MagneticButton>
						<Link href="/contact" className="link-underline eyebrow text-charcoal">
							Visit the salons
						</Link>
					</div>
				</Reveal>
			</div>
		</section>
	);
}

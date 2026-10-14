import { Reveal, RevealText } from '@/components/motion/reveal';
import { OpenTodayChip } from '@/components/home/open-today-chip';
import { siteConfig } from '@/lib/site-config';

export function ContactHero() {
	const { phone, email } = siteConfig.contact;
	return (
		<section className="bg-paper pb-16 pt-32 md:pb-20 md:pt-40">
			<div className="container-x grid items-end gap-12 lg:grid-cols-12">
				<div className="lg:col-span-8">
					<span className="eyebrow text-warm-gray">
						<span className="tabular">Nº 01</span> — Visit &amp; correspondence
					</span>
					<h1 className="display-xl mt-6 text-charcoal">
						<RevealText as="span" className="block" lineClassName="pb-[0.06em]" text="Come in," trigger="mount" />
						<RevealText as="span" className="block pl-[0.6em] text-accent" lineClassName="pb-[0.14em] font-display italic" text="or write." delay={0.12} trigger="mount" />
					</h1>
				</div>
				<Reveal delay={0.2} className="lg:col-span-4">
					<OpenTodayChip />
					<dl className="mt-6 space-y-3 border-t border-line pt-6 text-[15px]">
						<div className="flex justify-between gap-4">
							<dt className="eyebrow text-warm-gray">Telephone</dt>
							<dd>
								<a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="link-underline tabular text-charcoal">
									{phone}
								</a>
							</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="eyebrow text-warm-gray">Letters</dt>
							<dd>
								<a href={`mailto:${email}`} className="link-underline text-charcoal">
									{email}
								</a>
							</dd>
						</div>
					</dl>
				</Reveal>
			</div>
		</section>
	);
}

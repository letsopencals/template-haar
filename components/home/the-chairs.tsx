import Link from 'next/link';
import { clsx } from 'clsx';
import { Reveal } from '@/components/motion/reveal';
import { RevealArch } from '@/components/motion/reveal-arch';
import { SafeImage } from '@/components/ui/safe-image';
import { SectionHeading } from '@/components/home/section-heading';
import type { PublicStylist } from '@/lib/server-data';

export interface StylistCardProps {
	stylist: PublicStylist;
	index: number;
	/** Stagger every other card vertically on wide screens. */
	offset?: boolean;
	tone?: 'light' | 'dark';
	/** 'row' = swipeable snap row item on mobile (home); 'grid' = plain grid cell (about). */
	layout?: 'row' | 'grid';
}

/** Arch portrait, italic name, a hover-lifted specialties line and a "Book with …" link. */
export function StylistCard({ stylist, index, offset, tone = 'light', layout = 'row' }: StylistCardProps) {
	const dark = tone === 'dark';
	const specialty = stylist.specialties.slice(0, 2).join(' · ') || 'Stylist';
	return (
		<Reveal as="li" delay={(index % 4) * 0.08} className={clsx('group/card', layout === 'row' ? 'w-[68vw] shrink-0 snap-start sm:w-[42vw] md:w-auto' : null, offset ? 'md:even:mt-14' : null)}>
			<Link href={`/services?staff=${stylist.id}`} className="block outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
				<RevealArch className="aspect-[3/4] w-full">
					<SafeImage
						src={stylist.imageUrl}
						alt={`${stylist.firstName} ${stylist.lastName}`}
						fill
						sizes={layout === 'row' ? '(min-width: 1024px) 22vw, (min-width: 640px) 42vw, 68vw' : '(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 46vw'}
						className="object-cover object-top transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover/card:scale-[1.06]"
					/>
				</RevealArch>
				<div className="mt-5 flex items-baseline justify-between gap-3">
					<h3 className={clsx('font-display text-[1.65rem] leading-tight', dark ? 'text-white' : 'text-charcoal')}>
						<em>{stylist.firstName}</em> {stylist.lastName}
					</h3>
					<span className="tabular text-xs text-brass">{String(index + 1).padStart(2, '0')}</span>
				</div>
				<div className="mt-1 h-5 overflow-hidden text-[0.8rem]">
					<span className={clsx('block h-5 leading-5 transition-transform duration-500 ease-[var(--ease-expo)] md:group-hover/card:-translate-y-full md:group-focus-within/card:-translate-y-full', dark ? 'text-white/55' : 'text-warm-gray')}>
						{specialty}
					</span>
					<span className="eyebrow block h-5 leading-5 text-accent transition-transform duration-500 ease-[var(--ease-expo)] max-md:hidden md:group-hover/card:-translate-y-full md:group-focus-within/card:-translate-y-full">
						Book with {stylist.firstName} →
					</span>
				</div>
				<span className="eyebrow mt-2 block text-accent md:hidden">Book with {stylist.firstName} →</span>
			</Link>
		</Reveal>
	);
}

/**
 * Nº 04 — The Chairs: stylists straight from the API (portraits are real staff
 * photos). Grid on desktop, a swipeable snap row on mobile.
 */
export function TheChairs({ stylists, total, salons }: { stylists: PublicStylist[]; total: number; salons: number }) {
	if (stylists.length === 0) return null;
	return (
		<section id="stylists" className="section-y overflow-hidden bg-paper">
			<div className="container-x">
				<SectionHeading number="04" label="The Chairs" title="The hands" accent="behind it">
					<Reveal>
						<p className="max-w-sm text-[15px] leading-relaxed text-charcoal/70">
							<span className="tabular">{total}</span> stylists across <span className="tabular">{salons}</span> salons. Choose one when you book, or let
							us match you.
						</p>
						<Link href="/about#team" className="link-underline eyebrow mt-6 inline-block text-charcoal">
							Every chair →
						</Link>
					</Reveal>
				</SectionHeading>
			</div>
			<ul className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-5 px-5 pb-16 md:mx-auto md:mt-20 md:max-w-[1440px] md:grid md:grid-cols-4 md:gap-x-8 md:gap-y-14 md:overflow-visible md:px-10">
				{stylists.map((s, i) => (
					<StylistCard key={s.id} stylist={s} index={i} offset />
				))}
			</ul>
		</section>
	);
}

'use client';

import Link from 'next/link';
import { RevealArch } from '@/components/motion/reveal-arch';
import { Reveal } from '@/components/motion/reveal';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { SafeImage } from '@/components/ui/safe-image';
import { DisplayTitle } from '@/components/services/display-title';
import { serviceBlurb } from '@/components/services/service-copy';

interface BookingHeaderProps {
	title: string;
	description?: string | null;
	image: string | null;
	meta?: string | null;
}

/** Breadcrumb back to The Menu, the service in display type, its standfirst and an arch plate. */
export function BookingHeader({ title, description, image, meta }: BookingHeaderProps) {
	return (
		<header className="grid items-end gap-10 md:grid-cols-12 md:gap-12">
			<div className="md:col-span-8">
				<nav aria-label="Breadcrumb">
					<ol className="eyebrow flex items-center gap-3 text-warm-gray">
						<li>
							<Link href="/services" className="link-underline text-charcoal">
								<span aria-hidden>&larr; </span>The Menu
							</Link>
						</li>
						<li aria-hidden>/</li>
						<li aria-current="page" className="truncate">
							Consultation card
						</li>
					</ol>
				</nav>
				<h1 className="display-md mt-8 text-charcoal">
					<DisplayTitle text={title} />
				</h1>
				<Reveal delay={0.15}>
					<p className="mt-6 max-w-[52ch] text-[17px] leading-[1.7] text-charcoal/80">{serviceBlurb(title, description)}</p>
					{meta ? <p className="tabular mt-4 text-xs tracking-wide text-warm-gray">{meta}</p> : null}
				</Reveal>
			</div>
			<figure className="hidden md:col-span-4 md:block">
				<div className="relative ml-auto w-full max-w-[15rem]">
					<ArchOutline className="absolute -inset-2.5 h-[calc(100%+1.25rem)] w-[calc(100%+1.25rem)]" />
					<RevealArch trigger="mount" className="aspect-[3/4] w-full">
						{image ? <SafeImage src={image} alt={title} fill sizes="240px" priority className="object-cover" /> : null}
					</RevealArch>
				</div>
			</figure>
		</header>
	);
}

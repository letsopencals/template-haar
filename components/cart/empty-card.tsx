import Link from 'next/link';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { buttonClasses } from '@/components/ui/button';

/** Editorial empty state for the drawer (and /checkout with no cart). */
export function EmptyCard({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
	return (
		<div className={className ?? 'flex h-full flex-col items-center justify-center py-10 text-center'}>
			<div className="relative h-44 w-32">
				<ArchOutline className="absolute inset-0 h-full w-full" />
				<ArchOutline className="absolute inset-0 h-full w-full translate-x-2.5 -translate-y-2.5 opacity-40" />
				<span className="absolute inset-x-0 top-[58%] font-display text-4xl italic text-brass" aria-hidden>
					H.
				</span>
			</div>
			<p className="eyebrow mt-8 text-warm-gray">Nothing held yet</p>
			<h3 className="display-sm mt-3 text-charcoal">
				Your card is <em>blank</em>
			</h3>
			<p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-warm-gray">
				Choose a service, a stylist and a time — we&rsquo;ll print it here and hold the chair while you check out.
			</p>
			<Link href="/services" onClick={onNavigate} className={buttonClasses({ variant: 'outline', size: 'md', className: 'mt-7' })}>
				Open The Menu
			</Link>
		</div>
	);
}

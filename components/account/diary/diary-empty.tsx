import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';
import { ArchOutline } from '@/components/motifs/arch-outline';

/** A blank diary page with a way into The Menu. */
export function DiaryEmpty({ title, body, cta = true }: { title: React.ReactNode; body: string; cta?: boolean }) {
	return (
		<div className="flex flex-col items-center border border-dashed border-line-strong px-6 py-16 text-center sm:py-24">
			<div className="relative h-24 w-16" aria-hidden>
				<ArchOutline className="absolute inset-0 h-full w-full" />
			</div>
			<p className="display-sm mt-8 text-charcoal [&_em]:text-accent">{title}</p>
			<p className="mt-4 max-w-md text-sm leading-relaxed text-warm-gray">{body}</p>
			{cta ? (
				<Link href="/services" className={buttonClasses({ className: 'mt-8' })}>
					Browse The Menu
				</Link>
			) : null}
		</div>
	);
}

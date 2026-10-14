import { clsx } from 'clsx';
import { RevealText } from '@/components/motion/reveal';

export interface SectionHeadingProps {
	/** "02" */
	number: string;
	/** "The Menu" (eyebrow). */
	label: string;
	/** Roman part of the headline (may contain \n). */
	title: string;
	/** Italic, accent-coloured emotional word. */
	accent: string;
	tone?: 'light' | 'dark';
	size?: 'lg' | 'md';
	className?: string;
	children?: React.ReactNode;
}

/**
 * Editorial section opener: "Nº 02 — The Menu" eyebrow, a line-masked Bodoni
 * headline whose last line is the italic accent word, and an optional aside
 * (children) aligned to the baseline on desktop.
 */
export function SectionHeading({ number, label, title, accent, tone = 'light', size = 'lg', className, children }: SectionHeadingProps) {
	const dark = tone === 'dark';
	return (
		<div className={clsx('grid gap-8 md:grid-cols-12 md:items-end', className)}>
			<div className="md:col-span-8">
				<span className={clsx('eyebrow', dark ? 'text-brass-light' : 'text-warm-gray')}>
					<span className="tabular">Nº {number}</span> — {label}
				</span>
				<h2 className={clsx(size === 'lg' ? 'display-lg' : 'display-md', 'mt-5', dark ? 'text-white' : 'text-charcoal')}>
					<RevealText as="span" className="block" lineClassName="pb-[0.06em]" text={title} />
					<RevealText
						as="span"
						className="block pl-[0.8em] text-accent"
						lineClassName="pb-[0.14em] font-display italic"
						text={accent}
						delay={0.12}
					/>
				</h2>
			</div>
			{children ? <div className="md:col-span-4 md:pb-3">{children}</div> : null}
		</div>
	);
}

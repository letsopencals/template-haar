import { Reveal } from '@/components/motion/reveal';

/** Two-column settings block: numbered title + note on the left, the form on the right. */
export function SettingsSection({
	numeral,
	title,
	note,
	children,
}: {
	numeral: string;
	title: string;
	note: string;
	children: React.ReactNode;
}) {
	return (
		<Reveal as="section" className="grid gap-8 border-t border-charcoal pt-8 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-16 lg:grid-cols-[minmax(0,22rem)_minmax(0,36rem)]">
			<div>
				<p className="eyebrow text-brass">{numeral}</p>
				<h2 className="mt-3 font-display text-3xl text-charcoal">{title}</h2>
				<p className="mt-3 text-sm leading-relaxed text-warm-gray">{note}</p>
			</div>
			<div>{children}</div>
		</Reveal>
	);
}

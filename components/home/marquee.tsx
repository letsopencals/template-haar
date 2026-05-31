const items = [
	'Haircuts',
	'Coloring',
	'Keratin',
	'Blowouts',
	'Styling',
	'Scalp Care',
	'Balayage',
	'Extensions',
];

export function Marquee() {
	return (
		<section className="overflow-hidden border-y border-charcoal/10 bg-white py-6">
			<div className="animate-marquee flex whitespace-nowrap">
				{[...items, ...items].map((item, i) => (
					<span key={i} className="mx-8 flex items-center gap-8">
						<span className="font-display text-3xl font-light tracking-tight text-charcoal/80 md:text-4xl">
							{item}
						</span>
						<span className="text-accent">&#x2022;</span>
					</span>
				))}
			</div>
		</section>
	);
}

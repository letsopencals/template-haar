import type { PublicLocation } from '@/lib/server-data';

// Fixed pin positions on the decorative "street plan" (percent of the card).
const PINS = [
	{ x: 34, y: 38 },
	{ x: 64, y: 58 },
	{ x: 48, y: 76 },
	{ x: 76, y: 28 },
] as const;

/** Decorative engraved street-plan card with one pin per salon. Not a real map. */
export function MapCard({ locations }: { locations: PublicLocation[] }) {
	const pins = (locations.length > 0 ? locations : [{ id: 'default', title: 'HAAR', addressLines: [] }]).slice(0, PINS.length);
	return (
		<figure className="grain relative aspect-[4/3] overflow-hidden border border-line bg-cream sm:aspect-[16/9]">
			<svg aria-hidden viewBox="0 0 160 90" preserveAspectRatio="none" className="absolute inset-0 h-full w-full text-charcoal/15">
				<g fill="none" stroke="currentColor" strokeWidth="0.35">
					<path d="M-5 20 L170 34" />
					<path d="M-5 52 L170 46" />
					<path d="M-5 78 C40 70 90 92 170 72" />
					<path d="M30 -5 L44 95" />
					<path d="M86 -5 L78 95" />
					<path d="M124 -5 C118 30 136 60 128 95" />
				</g>
				<g fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.6">
					<path d="M-5 62 C30 58 60 66 100 58 S150 48 170 54" />
				</g>
				<rect x="96" y="8" width="20" height="14" fill="currentColor" opacity="0.35" />
				<circle cx="16" cy="36" r="7" fill="currentColor" opacity="0.25" />
			</svg>
			{pins.map((loc, i) => {
				const pos = PINS[i]!;
				return (
					<div key={loc.id} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
						<div className="flex flex-col items-center">
							<span className="whitespace-nowrap bg-charcoal px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white">
								<span className="tabular text-brass-light">{String(i + 1).padStart(2, '0')}</span> {loc.title}
							</span>
							<span className="h-4 w-px bg-charcoal" />
							<span className="h-2 w-2 rounded-full bg-accent ring-4 ring-accent/20" />
						</div>
					</div>
				);
			})}
			<figcaption className="absolute bottom-3 left-4 flex items-center gap-3 text-[0.68rem] text-charcoal/55">
				<span aria-hidden className="font-display text-base italic text-charcoal/70">N ↑</span>
				<span className="tabular">Plan of the salons — not to scale</span>
			</figcaption>
		</figure>
	);
}

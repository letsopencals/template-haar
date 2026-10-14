import { siteConfig } from '@/lib/site-config';

/** "Before your visit" checklist — copy lives in siteConfig.beforeYourVisit. */
export function BeforeYourVisit({ directionsHref }: { directionsHref?: string | null }) {
	const items = siteConfig.beforeYourVisit;
	return (
		<section aria-labelledby="before-visit-title" className="border-t border-line pt-8">
			<p className="eyebrow text-warm-gray">A note from the salon</p>
			<h2 id="before-visit-title" className="display-sm mt-2 text-charcoal">
				Before your <em>visit</em>
			</h2>
			<ol className="mt-6 space-y-5">
				{items.map((item, i) => (
					<li key={item.title} className="flex gap-4">
						<span className="tabular w-6 shrink-0 pt-0.5 text-xs text-brass">{String(i + 1).padStart(2, '0')}</span>
						<div>
							<p className="text-[0.95rem] text-charcoal">{item.title}</p>
							<p className="mt-1 text-sm leading-relaxed text-warm-gray">{item.body}</p>
						</div>
					</li>
				))}
			</ol>
			{directionsHref ? (
				<a
					href={directionsHref}
					target="_blank"
					rel="noopener noreferrer"
					className="eyebrow link-underline mt-7 inline-block text-[0.62rem] text-charcoal hover:text-accent"
				>
					Get directions to the salon <span aria-hidden>↗</span>
					<span className="sr-only"> (opens in a new tab)</span>
				</a>
			) : null}
		</section>
	);
}

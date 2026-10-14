/** Plaster placeholders while account data loads (no spinners on paper). */
export function DiarySkeleton() {
	return (
		<div className="space-y-16" aria-busy="true" aria-label="Loading your diary">
			<div className="grid gap-10 border border-line p-6 sm:p-10 md:grid-cols-[15rem_1fr] lg:p-14">
				<div className="arch image-placeholder mx-auto aspect-[3/4] w-full max-w-[15rem] animate-pulse" />
				<div className="space-y-5 self-center">
					<div className="h-3 w-32 animate-pulse bg-cream-dark" />
					<div className="h-10 w-3/4 animate-pulse bg-cream-dark" />
					<div className="h-20 w-full animate-pulse bg-cream" />
				</div>
			</div>
			<ListSkeleton rows={3} />
		</div>
	);
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
	return (
		<div aria-busy="true">
			{Array.from({ length: rows }, (_, i) => (
				<div key={i} className="flex items-center gap-6 border-b border-line py-6">
					<div className="h-16 w-14 animate-pulse bg-cream-dark" />
					<div className="flex-1 space-y-3">
						<div className="h-5 w-1/2 animate-pulse bg-cream-dark" />
						<div className="h-3 w-1/3 animate-pulse bg-cream" />
					</div>
				</div>
			))}
		</div>
	);
}

export function PanelSkeleton() {
	return (
		<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-busy="true">
			<div className="space-y-6">
				<div className="h-3 w-40 animate-pulse bg-cream-dark" />
				<div className="h-14 w-2/3 animate-pulse bg-cream-dark" />
				<div className="h-64 animate-pulse bg-cream" />
			</div>
			<div className="h-80 animate-pulse bg-cream" />
		</div>
	);
}

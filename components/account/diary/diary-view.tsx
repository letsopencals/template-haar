'use client';

import { useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import type { AppointmentListItemResponse, CollectionMeta } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { useNow } from '@/hooks/use-now';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/motion/reveal';
import { Notice } from '@/components/auth/auth-feedback';
import { NextVisit } from '@/components/account/diary/next-visit';
import { DiaryEntry } from '@/components/account/diary/diary-entry';
import { DiaryEmpty } from '@/components/account/diary/diary-empty';
import { DiarySkeleton } from '@/components/account/skeletons';
import { isUpcoming } from '@/components/account/appointment-utils';

type Page = { data: AppointmentListItemResponse[]; meta: CollectionMeta };

const PAGE_SIZE = 20;
const SWR_OPTIONS = { revalidateOnFocus: false, revalidateFirstPage: false } as const;

// Newest start first: page 1 holds the future and the most recent past.
function getKey(index: number, previous: Page | null): string | null {
	if (previous && previous.meta && index + 1 > previous.meta.pageCount) return null;
	return `/api/account/appointments?take=${PAGE_SIZE}&page=${index + 1}&orderBy=from&order=DESC`;
}

/**
 * The diary: the next visit as a hero, then the rest of what's coming up
 * (soonest first) and the past (most recent first), with "Earlier entries"
 * paging back through history.
 */
export function DiaryView() {
	const { data, error, isLoading, size, setSize, isValidating } = useSWRInfinite<Page>(getKey, fetcher, SWR_OPTIONS);
	const nowDate = useNow(60_000);
	const now = nowDate?.getTime() ?? null;

	const { next, upcoming, past } = useMemo(() => {
		const all = (data ?? []).flatMap((p) => p.data ?? []);
		// Dedupe (pages can shift as bookings change) and sort client-side too.
		const seen = new Set<string>();
		const list = all.filter((a) => (seen.has(a.id) ? false : (seen.add(a.id), true)));
		if (now === null) return { next: null, upcoming: [], past: [] };
		const future = list
			.filter((a) => isUpcoming(a, now))
			.sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
		const before = list
			.filter((a) => !isUpcoming(a, now))
			.sort((a, b) => new Date(b.from).getTime() - new Date(a.from).getTime());
		return { next: future[0] ?? null, upcoming: future.slice(1), past: before };
	}, [data, now]);

	if (error && !data) {
		return <Notice>We couldn’t open your diary just now. Please refresh to try again.</Notice>;
	}
	if (isLoading || !data || now === null) return <DiarySkeleton />;

	const lastMeta = data[data.length - 1]?.meta;
	const hasMore = !!lastMeta && size < lastMeta.pageCount;
	const loadingMore = isValidating && size > data.length;

	if (!next && upcoming.length === 0 && past.length === 0 && !hasMore) {
		return (
			<DiaryEmpty
				title={
					<>
						A fresh <em>page</em>.
					</>
				}
				body="Nothing in your diary yet. Choose a service from The Menu and it will appear here, with reminders and an easy way to move it."
			/>
		);
	}

	return (
		<div className="space-y-20 md:space-y-28">
			{next ? (
				<NextVisit appointment={next} now={now} />
			) : (
				<DiaryEmpty
					title={
						<>
							Nothing <em>booked</em>.
						</>
					}
					body="No upcoming visits. Your chair is waiting whenever you are."
				/>
			)}

			{upcoming.length > 0 ? (
				<DiarySection numeral="Nº 01" title="Coming up" count={upcoming.length}>
					{upcoming.map((a) => (
						<DiaryEntry key={a.id} appointment={a} />
					))}
				</DiarySection>
			) : null}

			{past.length > 0 || hasMore ? (
				<DiarySection numeral={upcoming.length > 0 ? 'Nº 02' : 'Nº 01'} title="Past entries">
					{past.map((a) => (
						<DiaryEntry key={a.id} appointment={a} past />
					))}
				</DiarySection>
			) : null}

			{hasMore ? (
				<div className="-mt-10 flex justify-center md:-mt-16">
					<Button variant="outline" onClick={() => setSize(size + 1)} disabled={loadingMore}>
						{loadingMore ? 'Turning the pages…' : 'Earlier entries'}
					</Button>
				</div>
			) : null}
		</div>
	);
}

function DiarySection({
	numeral,
	title,
	count,
	children,
}: {
	numeral: string;
	title: string;
	count?: number;
	children: React.ReactNode;
}) {
	return (
		<section aria-label={title}>
			<Reveal className="flex items-baseline justify-between gap-6 border-b border-charcoal pb-4">
				<h2 className="flex items-baseline gap-4">
					<span className="eyebrow text-brass">{numeral}</span>
					<span className="font-display text-3xl text-charcoal md:text-4xl">{title}</span>
				</h2>
				{count ? <span className="tabular text-sm text-warm-gray">{String(count).padStart(2, '0')}</span> : null}
			</Reveal>
			<ul>{children}</ul>
		</section>
	);
}

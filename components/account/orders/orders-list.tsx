'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import type { CollectionMeta, OrderListItemResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { formatPrice } from '@/lib/format';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { StatusBadge } from '@/components/ui/status-badge';
import { Reveal } from '@/components/motion/reveal';
import { Notice } from '@/components/auth/auth-feedback';
import { ListSkeleton } from '@/components/account/skeletons';
import { DiaryEmpty } from '@/components/account/diary/diary-empty';

type Page = { data: OrderListItemResponse[]; meta: CollectionMeta };

const PAGE_SIZE = 10;
const SWR_OPTIONS = { revalidateOnFocus: false, keepPreviousData: true } as const;

/** Every receipt, newest first, as a stack of ticket stubs. */
export function OrdersList() {
	const [page, setPage] = useState(1);
	const { data, error, isLoading } = useSWR<Page>(`/api/account/orders?take=${PAGE_SIZE}&page=${page}`, fetcher, SWR_OPTIONS);

	if (error && !data) return <Notice>We couldn’t load your receipts just now. Please refresh to try again.</Notice>;
	if (isLoading && !data) return <ListSkeleton rows={4} />;

	const orders = data?.data ?? [];
	const meta = data?.meta;

	if (orders.length === 0 && page === 1) {
		return (
			<DiaryEmpty
				title={
					<>
						No <em>receipts</em> yet.
					</>
				}
				body="Once you book and pay for a visit, the receipt is filed here."
			/>
		);
	}

	return (
		<div>
			<Reveal className="flex items-baseline justify-between gap-6 border-b border-charcoal pb-4">
				<h2 className="flex items-baseline gap-4">
					<span className="eyebrow text-brass">Nº 01</span>
					<span className="font-display text-3xl text-charcoal md:text-4xl">Receipts</span>
				</h2>
				{meta ? <span className="tabular text-sm text-warm-gray">{String(meta.itemCount).padStart(2, '0')}</span> : null}
			</Reveal>

			<ul className="mt-8 space-y-4">
				{orders.map((order) => (
					<OrderStub key={order.id} order={order} />
				))}
			</ul>

			{meta && meta.pageCount > 1 ? (
				<nav aria-label="Receipt pages" className="mt-10 flex items-center justify-center gap-6">
					<PagerButton disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} label="Newer" dir={-1} />
					<span className="tabular text-xs text-warm-gray">
						{String(meta.page).padStart(2, '0')} / {String(meta.pageCount).padStart(2, '0')}
					</span>
					<PagerButton
						disabled={page >= meta.pageCount}
						onClick={() => setPage((p) => Math.min(meta.pageCount, p + 1))}
						label="Older"
						dir={1}
					/>
				</nav>
			) : null}
		</div>
	);
}

function OrderStub({ order }: { order: OrderListItemResponse }) {
	const { formatCustom } = useDateFormatter();
	const currency = order.paymentCurrencyCode;
	const titles = (order.lineItems ?? []).map((li) => li.appointment?.product?.title).filter(Boolean) as string[];

	return (
		<li>
			<Link
				href={`/account/orders/${order.id}`}
				className="group grid grid-cols-[minmax(0,1fr)_auto] border border-line bg-paper transition-colors hover:border-charcoal/40 hover:bg-cream/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:grid-cols-[6.5rem_minmax(0,1fr)_auto]"
			>
				<div className="hidden flex-col items-center justify-center border-r border-dashed border-line-strong px-4 py-5 text-center sm:flex">
					<span className="eyebrow text-brass">{formatCustom(order.createdAt, 'MMM')}</span>
					<span className="mt-1 font-display text-4xl leading-none text-charcoal">{formatCustom(order.createdAt, 'D')}</span>
					<span className="tabular mt-1.5 text-[0.65rem] text-warm-gray">{formatCustom(order.createdAt, 'YYYY')}</span>
				</div>
				<div className="min-w-0 px-5 py-5 sm:px-7">
					<p className="eyebrow text-warm-gray">
						Receipt Nº {order.name}
						<span className="sm:hidden"> · {formatCustom(order.createdAt, 'D MMM YYYY')}</span>
					</p>
					<p className="mt-2 truncate font-display text-xl text-charcoal">{titles.length > 0 ? titles.join(', ') : 'Salon visit'}</p>
					<div className="mt-3 flex flex-wrap gap-2">
						<StatusBadge kind="payment" status={order.paymentStatus} />
						{order.refundStatus && order.refundStatus !== 'unrefunded' ? (
							<StatusBadge kind="refund" status={order.refundStatus} />
						) : null}
					</div>
				</div>
				<div className="flex flex-col items-end justify-center gap-2 px-5 py-5 sm:px-7">
					<span className="tabular text-lg text-charcoal">{formatPrice(order.total, currency)}</span>
					<span aria-hidden className="text-warm-gray transition-transform duration-500 group-hover:translate-x-1 group-hover:text-accent">
						→
					</span>
				</div>
			</Link>
		</li>
	);
}

function PagerButton({ disabled, onClick, label, dir }: { disabled: boolean; onClick: () => void; label: string; dir: 1 | -1 }) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className="eyebrow flex items-center gap-2 border border-line px-4 py-2.5 text-charcoal transition-colors hover:border-charcoal focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-30"
		>
			{dir === -1 ? <span aria-hidden>←</span> : null}
			{label}
			{dir === 1 ? <span aria-hidden>→</span> : null}
		</button>
	);
}

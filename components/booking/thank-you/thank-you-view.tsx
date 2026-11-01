'use client';

import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, type Transition } from 'framer-motion';
import type { OrderDetailResponse, StorefrontAppointmentPendingReason } from '@opencals/storefront-sdk';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_OUT } from '@/components/motion/easing';
import { useConfirmedAppointments } from './confirmed-model';
import { ConfirmedTicket } from './confirmed-ticket';
import { BeforeYourVisit } from './before-your-visit';
import { AccountPrompt } from './account-prompt';
import { GuestFallback } from './guest-fallback';
import { SettleUp } from './settle-up';
import { useHydrated } from '@/hooks/use-hydrated';
import { recallCheckout, waitingReason } from '@/lib/checkout-outcome';

// Guests can't read the order (the route requires a session) — resolve to null
// rather than throwing, and don't go through lib/fetcher (its 401 handler would
// treat this as an expired session).
async function orderFetcher(url: string): Promise<OrderDetailResponse | null> {
	try {
		const res = await fetch(url);
		return res.ok ? ((await res.json()) as OrderDetailResponse) : null;
	} catch {
		return null;
	}
}

const SWR_OPTIONS = { revalidateOnFocus: false, revalidateIfStale: false, shouldRetryOnError: false } as const;

const MASK_INITIAL = { y: '105%' };
const MASK_ANIMATE = { y: '0%' };
const TITLE_TRANSITION: Transition = { duration: DURATION.slow, ease: EASE_OUT, delay: 0.1 };
const SIDE_INITIAL = { opacity: 0, y: 24 };
const SIDE_ANIMATE = { opacity: 1, y: 0 };
const SIDE_TRANSITION: Transition = { duration: DURATION.base, ease: EASE_OUT, delay: 0.5 };

const LEAD: Record<StorefrontAppointmentPendingReason, string> = {
	awaiting_payment: 'Your chair is held until the payment arrives. We confirm the booking by email as soon as it does.',
	awaiting_approval: 'The salon reviews this booking before confirming it. You’ll have an email as soon as it’s confirmed.',
};
const OWING = new Set(['unpaid', 'partially-paid']);

export function ThankYouView() {
	const orderId = useSearchParams().get('orderId');
	const { status } = useSession();
	const reduce = useReducedMotion();

	const { data: order, isLoading } = useSWR(orderId ? `/api/account/orders/${orderId}` : null, orderFetcher, SWR_OPTIONS);
	const rows = useConfirmedAppointments(order ?? null);
	const directions = rows.find((r) => r.directionsHref)?.directionsHref ?? null;

	// What submit answered, kept in this tab: instructions to pay, and the state for guests who can't read the order.
	const hydrated = useHydrated();
	const memo = hydrated ? recallCheckout(orderId) : null;
	// Confirmed unless an appointment is `pending` with a reason (no reason = being confirmed right now).
	const waiting = order ? waitingReason((order.lineItems ?? []).map((li) => li.appointment)) : (memo?.waiting ?? null);
	const paymentStatus = order?.paymentStatus ?? memo?.paymentStatus ?? null;
	const settleUp =
		(paymentStatus && OWING.has(paymentStatus)) || memo?.instructions ? (
			<SettleUp
				provider={memo?.provider ?? null}
				instructions={memo?.instructions ?? null}
				dueAt={memo?.dueAt ?? order?.paymentDueAt ?? null}
				reference={memo?.orderName ?? order?.name ?? null}
			/>
		) : null;

	return (
		<section className="bg-paper pt-28 pb-24 sm:pt-32 lg:pt-40 lg:pb-32">
			<div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
				<header className="border-b border-line pb-8 sm:pb-10">
					<p className="eyebrow text-warm-gray">
						<span className="tabular text-brass">Nº 05</span> — {waiting ? 'Received' : 'Confirmed'}
					</p>
					<h1 className="display-lg mt-6 overflow-hidden pb-[0.08em] text-charcoal">
						<motion.span className="block" initial={reduce ? false : MASK_INITIAL} animate={MASK_ANIMATE} transition={TITLE_TRANSITION}>
							Thank you. <em>{waiting ? 'Almost there.' : 'See you soon.'}</em>
						</motion.span>
					</h1>
					{waiting ? <p className="mt-5 max-w-[52ch] text-[0.95rem] leading-relaxed text-warm-gray">{LEAD[waiting]}</p> : null}
				</header>

				{isLoading ? (
					<div className="mt-14 grid gap-12 lg:grid-cols-12" aria-busy="true" aria-label="Loading your booking">
						<div className="image-placeholder h-[420px] lg:col-span-7" />
						<div className="hidden space-y-4 lg:col-span-5 lg:block">
							<div className="image-placeholder h-8 w-1/2" />
							<div className="image-placeholder h-40" />
						</div>
					</div>
				) : !order ? (
					<>
						<GuestFallback orderId={orderId} />
						{settleUp ? <div className="mx-auto mt-10 max-w-xl">{settleUp}</div> : null}
					</>
				) : (
					<div className="mt-16 grid gap-14 sm:mt-20 lg:grid-cols-12 lg:gap-16 xl:gap-24">
						<div className="lg:col-span-7">
							<ConfirmedTicket order={order} rows={rows} waiting={waiting} />
						</div>
						<motion.div
							className="space-y-10 lg:col-span-5"
							initial={reduce ? false : SIDE_INITIAL}
							animate={SIDE_ANIMATE}
							transition={SIDE_TRANSITION}
						>
							{settleUp}
							<BeforeYourVisit directionsHref={directions} />
							<AccountPrompt authenticated={status === 'authenticated'} />
						</motion.div>
					</div>
				)}
			</div>
		</section>
	);
}

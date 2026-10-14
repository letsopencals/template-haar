'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import type { AppointmentDetailResponse, CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { useNow } from '@/hooks/use-now';
import { Notice } from '@/components/auth/auth-feedback';
import { PanelSkeleton } from '@/components/account/skeletons';
import { DiaryEmpty } from '@/components/account/diary/diary-empty';
import { isUpcoming } from '@/components/account/appointment-utils';
import { getChangePolicy } from '@/components/account/appointment-detail/policy';
import { DetailHero } from '@/components/account/appointment-detail/detail-hero';
import { DetailSections } from '@/components/account/appointment-detail/detail-sections';
import { ActionsPanel } from '@/components/account/appointment-detail/actions-panel';
import { CancelModal } from '@/components/account/appointment-detail/cancel-modal';
import { RescheduleModal } from '@/components/account/appointment-detail/reschedule-modal';
import { formatLongDate, formatSlotRange } from '@/components/booking/slot-time';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { useSettings } from '@/contexts/settings-context';

type Dialog = 'cancel' | 'reschedule' | null;

const SWR_OPTIONS = { revalidateOnFocus: false } as const;

/** Any diary list (infinite keys are prefixed, so match on the path). */
const isDiaryKey = (key: unknown) => typeof key === 'string' && key.includes('/api/account/appointments?');

/**
 * One booking. `?action=cancel|reschedule` (from email links via /link/[token])
 * opens the matching sheet once the booking has loaded, if the policy allows.
 */
export function AppointmentDetailView({ appointmentId }: { appointmentId: string }) {
	const key = `/api/account/appointments/${appointmentId}`;
	const { data: appointment, error, isLoading, mutate } = useSWR<AppointmentDetailResponse>(key, fetcher, SWR_OPTIONS);
	const { mutate: globalMutate } = useSWRConfig();
	const { timezone } = useDateFormatter();
	const { timeFormat } = useSettings();
	const nowDate = useNow(60_000);

	const [dialog, setDialog] = useState<Dialog>(null);
	const [notice, setNotice] = useState<{ tone: 'success' | 'info'; text: string } | null>(null);
	const actionHandledRef = useRef(false);

	const now = nowDate?.getTime() ?? null;
	const policy = appointment && now !== null ? getChangePolicy(appointment, now) : null;

	// Deep-link action: open once, then drop the param so a refresh doesn't reopen it.
	useEffect(() => {
		if (!appointment || !policy || actionHandledRef.current) return;
		actionHandledRef.current = true;
		const params = new URLSearchParams(window.location.search);
		const action = params.get('action');
		if (!action) return;
		params.delete('action');
		const qs = params.toString();
		window.history.replaceState(window.history.state, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);

		if (action === 'reschedule') {
			if (policy.canReschedule) setDialog('reschedule');
			else setNotice({ tone: 'info', text: 'This booking can no longer be moved online. Please call the salon.' });
		} else if (action === 'cancel') {
			if (policy.canCancel) setDialog('cancel');
			else setNotice({ tone: 'info', text: 'This booking can no longer be cancelled online. Please call the salon.' });
		}
	}, [appointment, policy]);

	if (error && !appointment) {
		return (
			<DiaryEmpty
				title={
					<>
						Not in your <em>diary</em>.
					</>
				}
				body="We couldn’t find this booking. It may belong to another account, or the link is out of date."
			/>
		);
	}
	if (isLoading || !appointment || !policy || now === null) return <PanelSkeleton />;

	const upcoming = isUpcoming(appointment, now);

	const refreshAll = async () => {
		await mutate();
		await globalMutate(isDiaryKey);
	};

	const onRescheduled = async (slot: CurrentAvailabilitySlot) => {
		setDialog(null);
		setNotice({
			tone: 'success',
			text: `Moved to ${formatLongDate(slot.fromDate)}, ${formatSlotRange(slot, timezone, timeFormat)}. A confirmation is on its way.`,
		});
		await refreshAll();
	};

	const onCanceled = async () => {
		setDialog(null);
		setNotice({ tone: 'success', text: 'Your booking is cancelled. We’ve emailed a confirmation.' });
		await refreshAll();
	};

	return (
		<div>
			<Link
				href="/account"
				className="eyebrow inline-flex items-center gap-3 text-warm-gray transition-colors hover:text-charcoal focus-visible:outline-2 focus-visible:outline-accent"
			>
				<span aria-hidden>←</span> Back to the diary
			</Link>

			{notice ? (
				<Notice tone={notice.tone} className="mt-8">
					{notice.text}
				</Notice>
			) : null}

			<div className="mt-10">
				<DetailHero appointment={appointment} upcoming={upcoming} />
			</div>

			<div className="perforation my-14 md:my-20" aria-hidden />

			<div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-20">
				<DetailSections appointment={appointment} />
				<ActionsPanel
					appointment={appointment}
					policy={policy}
					upcoming={upcoming}
					onReschedule={() => setDialog('reschedule')}
					onCancel={() => setDialog('cancel')}
				/>
			</div>

			<RescheduleModal
				key={`r-${appointment.from}`}
				appointment={appointment}
				open={dialog === 'reschedule'}
				onClose={() => setDialog(null)}
				onRescheduled={onRescheduled}
			/>
			<CancelModal
				appointment={appointment}
				open={dialog === 'cancel'}
				onClose={() => setDialog(null)}
				onCanceled={onCanceled}
			/>
		</div>
	);
}

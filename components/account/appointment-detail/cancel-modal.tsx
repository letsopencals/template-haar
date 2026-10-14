'use client';

import { useState } from 'react';
import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { Modal } from '@/components/account/modal';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/auth/auth-feedback';
import { useDateFormatter } from '@/hooks/use-date-formatter';
import { onSessionExpired } from '@/lib/session-expired';
import { serviceTitle, stylistName } from '@/components/account/appointment-utils';

/**
 * Confirm a cancellation. The storefront API takes no reason, so this is a
 * plain confirm with a summary of what is being given up.
 */
export function CancelModal({
	appointment,
	open,
	onClose,
	onCanceled,
}: {
	appointment: AppointmentDetailResponse;
	open: boolean;
	onClose: () => void;
	onCanceled: () => void;
}) {
	const { formatCustom, formatTime } = useDateFormatter();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const stylist = stylistName(appointment);
	const paid = (appointment.order?.paidTotal ?? 0) > 0;

	const confirm = async () => {
		setSubmitting(true);
		setError(null);
		try {
			const res = await fetch(`/api/account/appointments/${appointment.id}/cancel`, { method: 'PUT' });
			if (res.status === 401) return onSessionExpired();
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				setError(body?.error ?? 'We couldn’t cancel this booking. Please try again or contact the salon.');
				return;
			}
			onCanceled();
		} catch {
			setError('Something went wrong. Please try again.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal
			open={open}
			onClose={onClose}
			busy={submitting}
			eyebrow="Nº 03 — Cancel"
			title={
				<>
					Cancel this <em>visit</em>?
				</>
			}
			description="We’ll free up the chair and email you a confirmation. This can’t be undone."
			footer={
				<>
					<Button variant="outline" onClick={onClose} disabled={submitting} data-autofocus>
						Keep my booking
					</Button>
					<button
						type="button"
						onClick={confirm}
						disabled={submitting}
						className="inline-flex items-center justify-center bg-red-700 px-7 py-3.5 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-50"
					>
						{submitting ? 'Cancelling…' : 'Yes, cancel'}
					</button>
				</>
			}
		>
			<div className="border border-line bg-cream/50 p-5">
				<p className="font-display text-xl text-charcoal">{serviceTitle(appointment)}</p>
				<p className="mt-1.5 text-sm text-warm-gray">
					{formatCustom(appointment.from, 'dddd D MMMM')} ·{' '}
					<span className="tabular">
						{formatTime(appointment.from)} – {formatTime(appointment.to)}
					</span>
					{stylist ? ` · with ${stylist}` : ''}
				</p>
			</div>
			{paid ? (
				<p className="mt-5 text-sm leading-relaxed text-warm-gray">
					You paid for this booking. Any refund follows the salon’s cancellation policy and goes back to the original
					payment method.
				</p>
			) : null}
			{error ? <Notice className="mt-5">{error}</Notice> : null}
		</Modal>
	);
}

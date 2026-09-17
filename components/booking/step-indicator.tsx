'use client';

import { memo } from 'react';
import { BOOKING_STEPS, STEP_LABELS, type BookingStep } from '@/lib/booking-constants';

export const BookingStepIndicator = memo(function BookingStepIndicator({
	currentStep,
}: {
	currentStep: BookingStep;
}) {
	const currentIdx = BOOKING_STEPS.indexOf(currentStep);

	return (
		<div className="mb-8 flex items-center gap-3 sm:gap-4">
			{BOOKING_STEPS.map((s, i) => (
				<div key={s} className="flex items-center gap-2 sm:gap-3">
					<div
						className={`flex h-8 w-8 items-center justify-center text-xs font-semibold transition-colors ${
							currentStep === s
								? 'bg-charcoal text-white'
								: i < currentIdx
									? 'bg-accent text-white'
									: 'bg-cream text-warm-gray'
						}`}
					>
						{i + 1}
					</div>
					<span
						className={`hidden text-xs font-medium uppercase tracking-[0.15em] sm:block ${
							currentStep === s ? 'text-charcoal' : 'text-warm-gray'
						}`}
					>
						{STEP_LABELS[s]}
					</span>
					{i < BOOKING_STEPS.length - 1 && <div className="h-px w-3 bg-charcoal/10 sm:w-6" />}
				</div>
			))}
		</div>
	);
});

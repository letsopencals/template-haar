export const BOOKING_STEPS = ['date', 'time', 'add-ons', 'confirm'] as const;
export type BookingStep = (typeof BOOKING_STEPS)[number];

export const STEP_LABELS: Record<BookingStep, string> = {
	date: 'Date',
	time: 'Time',
	'add-ons': 'Add-ons',
	confirm: 'Confirm',
};

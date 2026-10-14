import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ThankYouView } from '@/components/booking/thank-you/thank-you-view';

export const metadata: Metadata = {
	title: 'Booking confirmed',
	robots: { index: false, follow: false },
};

export default function ThankYouPage() {
	return (
		// useSearchParams() in the view needs a Suspense boundary.
		<Suspense fallback={<div className="min-h-screen bg-paper" aria-busy="true" />}>
			<ThankYouView />
		</Suspense>
	);
}

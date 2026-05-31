import type { Metadata } from 'next';
export const metadata: Metadata = {
	title: 'Book Appointment',
	description: 'Choose a service, pick your preferred stylist, and select a time that works for you.',
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
	return children;
}

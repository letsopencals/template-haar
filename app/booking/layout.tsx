import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Consultation card',
	description: 'Choose your option, your stylist and a time — your appointment card fills itself in as you go.',
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
	return children;
}

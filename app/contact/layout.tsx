import type { Metadata } from 'next';
export const metadata: Metadata = {
	title: 'Contact',
	description: 'Get in touch with us. Find our address, phone, email, and working hours.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
	return children;
}

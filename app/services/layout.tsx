import type { Metadata } from 'next';
export const metadata: Metadata = {
	title: 'Services',
	description: 'Browse and book our full range of professional services.',
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
	return children;
}

import type { Metadata } from 'next';
export const metadata: Metadata = {
	title: 'About',
	description: 'Learn about our story, values, and the team behind the salon.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
	return children;
}

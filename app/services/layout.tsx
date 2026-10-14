import type { Metadata } from 'next';
export const metadata: Metadata = {
	title: 'The Menu',
	description: 'The HAAR menu — cuts, colour, treatments and styling. Choose your service, stylist and hour.',
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
	return children;
}

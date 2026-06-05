import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Providers } from '@/components/providers';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

const title = `${siteConfig.name} — ${siteConfig.tagline}`;

export const metadata: Metadata = {
	title: {
		default: title,
		template: `%s | ${siteConfig.name}`,
	},
	description: siteConfig.description,
	metadataBase: new URL(siteConfig.url),
	openGraph: {
		title,
		description: siteConfig.description,
		siteName: siteConfig.name,
		locale: 'en_US',
		type: 'website',
	},
	twitter: {
		card: 'summary_large_image',
		title,
		description: siteConfig.description,
	},
	robots: {
		index: true,
		follow: true,
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				{/* Allow parent frames to control scrolling via postMessage */}
				<script
					dangerouslySetInnerHTML={{
						__html: `window.addEventListener("message",function(e){if(e.data&&e.data.type==="scrollTo"&&e.data.id){var el=document.getElementById(e.data.id);if(el){var top=el.getBoundingClientRect().top+window.scrollY;window.scrollTo({top:top,behavior:"smooth"})}}if(e.data&&e.data.type==="scrollTop"){window.scrollTo({top:0,behavior:"smooth"})}});`,
					}}
				/>
				<Providers>
					<Header />
					<main>{children}</main>
					<Footer />
				</Providers>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'LocalBusiness',
							name: siteConfig.name,
							description: siteConfig.description,
							url: siteConfig.url,
							telephone: siteConfig.contact.phone,
							email: siteConfig.contact.email,
							address: {
								'@type': 'PostalAddress',
								streetAddress: siteConfig.contact.address.split('\n')[0],
								addressLocality: siteConfig.contact.address.split('\n')[1]?.trim(),
							},
						}),
					}}
				/>
			</body>
		</html>
	);
}

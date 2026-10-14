export interface NavLink {
	href: string;
	label: string;
	/** Short line under the link in the menu overlay. */
	note: string;
	/** Arch preview shown when the link is hovered in the overlay. */
	image: string;
}

export const NAV_LINKS: NavLink[] = [
	{ href: '/', label: 'Home', note: 'The current issue', image: '/images/hero/hero-main.jpg' },
	{ href: '/services', label: 'The Menu', note: 'Services & prices', image: '/images/hero/hero-services.jpg' },
	{ href: '/about', label: 'The House', note: 'Our story & chairs', image: '/images/about/main.jpg' },
	{ href: '/contact', label: 'Visit', note: 'Salons, hours, letters', image: '/images/hero/hero-testimonials.jpg' },
];

/** Inline masthead links (desktop). */
export const BAR_LINKS = [
	{ href: '/services', label: 'Services' },
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact' },
] as const;

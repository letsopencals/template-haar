/**
 * Site configuration — edit this file to customize all branding and copy.
 *
 * Every hardcoded salon name, tagline, contact detail, and homepage copy
 * is sourced from here so you can rebrand the entire template in one place.
 */

export const siteConfig = {
	name: 'HAAR',
	tagline: 'The Art of Hair',
	description:
		'Where artistry meets expertise. Premium hair salon offering haircuts, coloring, keratin treatments, and scalp therapy.',
	url: 'https://example.com',

	/** Logo rendered as: {text}{accent} */
	logo: { text: 'HAAR', accent: '.' },

	/** Hero section on the homepage */
	hero: {
		subtitle: 'Premium Hair Salon',
		heading: ['THE', 'ART OF'],
		headingAccent: 'Hair',
		body: 'Where artistry meets expertise. We craft looks that transform not just your appearance, but your confidence.',
		cta: { label: 'Book Appointment', href: '/services' },
		secondaryCta: { label: 'Our Services', href: '/services' },
		stat: { value: '15+', label: 'Years of\nExperience' },
		backgroundText: 'HAAR',
	},

	/** CTA section on the homepage */
	cta: {
		subtitle: 'Your Transformation Awaits',
		heading: ['CONFIDENCE', 'STARTS'],
		headingAccent: 'Here',
		body: "Every visit to our salon is more than just an appointment — it's a journey of self-discovery. Our expert stylists combine technical precision with creative vision to help you look and feel your absolute best.",
		stats: [
			{ value: '2,500+', label: 'Happy Clients' },
			{ value: '15+', label: 'Expert Stylists' },
			{ value: '98%', label: 'Satisfaction' },
		],
	},

	/** Services section on the homepage */
	services: [
		{
			title: 'Haircuts & Styling',
			description: 'Precision cuts tailored to your face shape, lifestyle, and personal style. From classic bobs to modern layers.',
			href: '/booking/haircuts-styling-long',
		},
		{
			title: 'Keratin Treatment',
			description: 'Smooth, frizz-free hair that lasts for months. Our premium keratin treatments restore shine and manageability.',
			href: '/booking/keratin-treatment-premium',
		},
		{
			title: 'Hair Coloring',
			description: 'From subtle highlights to bold transformations. Balayage, ombré, full color, and corrective coloring.',
			href: '/booking/hair-coloring-full',
		},
		{
			title: 'Blow Dry & Styling',
			description: 'Perfect blowouts for any occasion. Volume, sleekness, or textured waves — crafted to perfection.',
			href: '/booking/blow-dry-styling-short',
		},
		{
			title: 'Scalp Therapy',
			description: 'Revitalize your scalp health with our therapeutic treatments. Deep cleansing, nourishing, and rejuvenating care.',
			href: '/booking/scalp-therapy-basic',
		},
	],

	/** Booking banner on the homepage */
	bookingBanner: {
		heading: ['READY FOR A'],
		headingAccent: 'New Look?',
		body: "Book your appointment today and let our expert stylists craft a look that's uniquely you.",
	},

	/** About page */
	about: {
		heroSubtitle: 'About HAAR',
		heroHeading: ['WHERE ART', 'MEETS'],
		heroHeadingAccent: 'Expertise',
		heroBody:
			"More than a salon — we're a community of artists, innovators, and beauty enthusiasts dedicated to making every client feel extraordinary.",
		storyParagraphs: [
			'Founded in 2009, HAAR was born from a simple belief: that a salon visit should be more than a routine — it should be a transformative experience. Our founder, Victoria Lane, envisioned a space where artistry, expertise, and genuine care converge.',
			"What began as a boutique studio has grown into one of the city's most sought-after salons. Yet we've never lost our intimate, personal touch. Every client who walks through our doors is treated to the same dedication and attention that defined our very first day.",
			'Today, our team of 15+ expert stylists continues to push creative boundaries while maintaining the warm, welcoming atmosphere that makes HAAR feel like home.',
		],
		bottomCta: 'READY TO EXPERIENCE HAAR?',
		bottomCtaBody:
			'Book your first appointment and discover the difference that true artistry makes.',
	},

	/** Footer */
	footer: {
		description:
			"Where artistry meets expertise. We believe that beautiful hair is not just about style — it's about confidence, self-expression, and the transformative power of expert care.",
		socials: ['Instagram', 'Facebook', 'Pinterest'],
		serviceLinks: [
			{ label: 'Haircuts & Styling', href: '/booking/haircuts-styling-long' },
			{ label: 'Hair Coloring', href: '/booking/hair-coloring-full' },
			{ label: 'Keratin Treatment', href: '/booking/keratin-treatment-premium' },
			{ label: 'Blow Dry & Styling', href: '/booking/blow-dry-styling-short' },
			{ label: 'Scalp Therapy', href: '/booking/scalp-therapy-basic' },
		],
		companyLinks: [
			{ label: 'About Us', href: '/about' },
			{ label: 'Our Team', href: '/about#team' },
			{ label: 'Contact', href: '/contact' },
			{ label: 'Book Appointment', href: '/services' },
		],
	},

	/** Contact page */
	contact: {
		address: '123 Style Avenue, Suite 200\nNew York, NY 10001',
		phone: '+1 (212) 555-0190',
		email: 'hello@haar-salon.com',
		hours:
			'Mon — Fri: 9:00 AM — 8:00 PM\nSat: 9:00 AM — 6:00 PM\nSun: 10:00 AM — 5:00 PM',
	},

	/** Testimonials (homepage) */
	testimonials: [
		{
			quote:
				"I've been to many salons over the years, but HAAR is truly in a league of its own. The attention to detail, the warm atmosphere, and the incredible results keep me coming back every time.",
			author: 'Sarah Mitchell',
			role: 'Regular Client',
		},
		{
			quote:
				'My keratin treatment was absolutely transformative. My hair has never been this smooth and manageable. The team really knows their craft and takes the time to understand exactly what you want.',
			author: 'Emily Rodriguez',
			role: 'Keratin Treatment',
		},
		{
			quote:
				"The colorist at HAAR is a true artist. She understood exactly the shade of balayage I wanted and executed it flawlessly. I've received so many compliments since my appointment.",
			author: 'Jessica Chen',
			role: 'Hair Coloring',
		},
		{
			quote:
				'From the moment you walk in, you feel taken care of. The scalp therapy session was incredibly relaxing and my hair feels healthier than ever. This is self-care at its finest.',
			author: 'Amanda Brooks',
			role: 'Scalp Therapy',
		},
	],

	/** Team members shown on About page */
	team: [
		{
			name: 'Victoria Lane',
			role: 'Founder & Creative Director',
			bio: 'With over 20 years of experience in the industry, Victoria founded HAAR with a vision to redefine the salon experience.',
			image: 'team/victoria.jpg'
		},
		{
			name: 'Isabella Torres',
			role: 'Senior Colorist',
			bio: 'Specializing in balayage and creative color techniques, Isabella brings artistry and precision to every transformation.',
			image: 'team/isabella.jpg'
		},
		{
			name: 'Olivia Chen',
			role: 'Keratin & Treatment Specialist',
			bio: 'A certified trichologist and treatment expert, Olivia is passionate about restoring hair health from the inside out.',
			image: 'team/olivia.jpg'
		},
		{
			name: 'Sophie Martin',
			role: 'Lead Stylist',
			bio: 'Known for her precision cuts and editorial styling, Sophie has worked with top fashion houses and editorial teams.',
			image: 'team/sophie.jpg'
		},
	],

	/** Values shown on About page */
	values: [
		{
			number: '01',
			title: 'Artistry First',
			description:
				'We approach every service as a creative endeavor. Each cut, color, and style is a unique expression of our craft.',
		},
		{
			number: '02',
			title: 'Client-Centered Care',
			description:
				'Your vision drives everything we do. We listen deeply, consult thoughtfully, and deliver results that exceed expectations.',
		},
		{
			number: '03',
			title: 'Continuous Excellence',
			description:
				"Our team trains with the world's leading educators. We stay ahead of trends while mastering timeless techniques.",
		},
		{
			number: '04',
			title: 'Sustainable Beauty',
			description:
				'We use clean, responsibly sourced products and implement eco-friendly practices throughout our salon.',
		},
	],
};

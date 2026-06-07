import { Hero } from '@/components/home/hero';
import { Marquee } from '@/components/home/marquee';
import { ServicesSection } from '@/components/home/services-section';
import { CtaSection } from '@/components/home/cta-section';
import { Gallery } from '@/components/home/gallery';
import { Testimonials } from '@/components/home/testimonials';
import { BookingBanner } from '@/components/home/booking-banner';
import { Analytics } from "@vercel/analytics/next"

export default function HomePage() {
	return (
		<>
			<Hero />
			<Marquee />
			<ServicesSection />
			<CtaSection />
			<Gallery />
			<Testimonials />
			<BookingBanner />
			<Analytics />
		</>
	);
}

import { AboutHero } from '@/components/about/about-hero';
import { Story } from '@/components/about/story';
import { Manifesto } from '@/components/about/manifesto';
import { Team } from '@/components/about/team';
import { ClosingCta } from '@/components/about/closing-cta';
import { getStylists } from '@/lib/server-data';

export default async function AboutPage() {
	const stylists = await getStylists();
	// Stylists with a portrait first; the API order is otherwise preserved.
	const ordered = [...stylists.filter((s) => s.imageUrl), ...stylists.filter((s) => !s.imageUrl)];

	return (
		<>
			<AboutHero />
			<Story />
			<Manifesto />
			<Team stylists={ordered} />
			<ClosingCta />
		</>
	);
}

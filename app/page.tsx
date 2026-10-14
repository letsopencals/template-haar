import { Analytics } from '@vercel/analytics/next';
import { Hero } from '@/components/home/hero';
import { Ticker } from '@/components/home/ticker';
import { TheMenu } from '@/components/home/the-menu';
import { TheRitual } from '@/components/home/the-ritual';
import { TheChairs } from '@/components/home/the-chairs';
import { Lookbook } from '@/components/home/lookbook';
import { Letters } from '@/components/home/letters';
import { Spread, type SpreadStat } from '@/components/home/spread';
import { buildMenu } from '@/components/home/menu-data';
import { getPhysicalLocations, getProducts, getStoreSettings, getStylists } from '@/lib/server-data';

const FOUNDED = 2009;
const SEASONS = ['Winter', 'Spring', 'Summer', 'Autumn'] as const;

function issueLabel(now: Date): string {
	const season = SEASONS[Math.floor(((now.getMonth() + 1) % 12) / 3)];
	// One volume per year since the house opened.
	const issue = now.getFullYear() - FOUNDED;
	return `Issue Nº ${String(issue).padStart(2, '0')} · ${season} ${now.getFullYear()}`;
}

export default async function HomePage() {
	const [products, stylists, locations, settings] = await Promise.all([getProducts(), getStylists(), getPhysicalLocations(), getStoreSettings()]);
	const menu = buildMenu(products);
	const optionCount = products.reduce((n, p) => n + (p.variants?.length || 1), 0);
	const currency = settings?.currency ?? 'USD';
	const now = new Date();
	const featured = [...stylists].sort((a, b) => Number(!!b.imageUrl) - Number(!!a.imageUrl)).slice(0, 8);

	const stats: SpreadStat[] = [
		{ value: now.getFullYear() - FOUNDED, label: 'Years behind the chair' },
		{ value: stylists.length || 15, label: 'Stylists on the floor' },
		{ value: locations.length || 1, label: locations.length === 1 ? 'Salon' : 'Salons, one standard' },
		{ value: 2500, suffix: '+', label: 'Regulars and counting' },
	];

	return (
		<>
			<Hero issueLabel={issueLabel(now)} />
			<Ticker />
			<TheMenu entries={menu} currency={currency} optionCount={optionCount} />
			<TheRitual entries={menu} />
			<TheChairs stylists={featured} total={stylists.length} salons={locations.length || 1} />
			<Lookbook />
			<Letters />
			<Spread stats={stats} />
			<Analytics />
		</>
	);
}

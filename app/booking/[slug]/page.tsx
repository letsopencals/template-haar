import type { ProductListItemResponse } from '@opencals/storefront-sdk';
import { getProduct } from '@/lib/server-data';
import { BookingView } from '@/components/booking/booking-view';

type SearchParams = { date?: string | string[]; staff?: string | string[]; location?: string | string[] };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

// Server Component: fetch the product on the server and seed the client
// composer so it renders immediately. Deep links (?date=YYYY-MM-DD&staff=<id>
// &location=<id>) pre-fill the card and unlock the sections they answer.
export default async function BookingPage({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<SearchParams>;
}) {
	const [{ slug }, query] = await Promise.all([params, searchParams]);
	const product = await getProduct(slug);

	// getProduct returns the slug-shaped response, which the booking flow has
	// always consumed as ProductListItemResponse (same runtime shape). An
	// unknown slug can come back as a non-JSON body, so only pass real products
	// (anything else isn't serialisable to the client component).
	const isProduct = !!product && typeof (product as { id?: unknown }).id === 'string';
	const initialProduct = isProduct ? (product as unknown as ProductListItemResponse) : null;

	const date = first(query.date);
	const deepLink = {
		date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
		staffId: first(query.staff),
		locationId: first(query.location),
	};

	return <BookingView slug={slug} initialProduct={initialProduct} deepLink={deepLink} />;
}

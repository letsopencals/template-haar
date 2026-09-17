import type { ProductListItemResponse } from '@opencals/storefront-sdk';
import { getProduct } from '@/lib/server-data';
import { BookingView } from '@/components/booking/booking-view';

// Server Component: fetch the product on the server and seed the client booking
// flow so it renders immediately (no loading flash). The booking flow keeps
// revalidating via SWR against /api/products/[slug].
export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const product = await getProduct(slug);

	// getProduct returns the slug-shaped response, which the booking flow has
	// always consumed as ProductListItemResponse (same runtime shape, extra
	// per-variant fields are simply unused).
	const initialProduct = (product as unknown as ProductListItemResponse) ?? null;

	return <BookingView slug={slug} initialProduct={initialProduct} />;
}

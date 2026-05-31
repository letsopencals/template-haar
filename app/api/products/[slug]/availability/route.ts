import { productGetCurrentAvailabilities, productGetBySlug } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	const { searchParams } = request.nextUrl;
	const date = searchParams.get('date');
	const timezone = searchParams.get('timezone') ?? undefined;
	const staffMemberId = searchParams.get('staffMemberId') ?? undefined;
	const locationId = searchParams.get('locationId') ?? undefined;

	if (!date) {
		return NextResponse.json(
			{ error: 'date query parameter is required' },
			{ status: 400 },
		);
	}

	try {
		// First get the product ID from slug
		const productResponse = await productGetBySlug({
			path: { slug },
		});

		if (productResponse.error || !productResponse.data) {
			return NextResponse.json(
				{ error: 'Product not found' },
				{ status: 404 },
			);
		}

		const product = productResponse.data;

		const response = await productGetCurrentAvailabilities({
			path: { productId: product.id },
			query: { date, timezone, staffMemberId, locationId },
		});

		if (response.error) {
			return NextResponse.json(
				{ error: 'Failed to fetch availability' },
				{ status: 500 },
			);
		}

		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Availability API error:', err);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

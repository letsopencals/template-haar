import { productList } from '@opencals/storefront-sdk';
import '@/lib/opencals'; // ensure SDK is initialized
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const locationId = request.nextUrl.searchParams.get('locationId') ?? undefined;

	try {
		const response = await productList({
			query: { take: 50, locationId },
		});

		if (response.error) {
			return NextResponse.json(
				{ error: 'Failed to fetch products' },
				{ status: 500 },
			);
		}

		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Products API error:', err);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

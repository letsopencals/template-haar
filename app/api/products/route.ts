import '@/lib/opencals';
import { ProductService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const locationId = request.nextUrl.searchParams.get('locationId') ?? undefined;

	try {
		const { data } = await ProductService.list({ query: { take: 50, locationId } });
		return NextResponse.json(data);
	} catch (err) {
		console.error('Products API error:', err);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

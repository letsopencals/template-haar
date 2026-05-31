import { productGetCurrentAvailabilities } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const productId = searchParams.get('productId');
	const date = searchParams.get('date');
	const timezone = searchParams.get('timezone') ?? undefined;
	const staffMemberId = searchParams.get('staffMemberId') ?? undefined;
	const locationId = searchParams.get('locationId') ?? undefined;

	if (!productId || !date) {
		return NextResponse.json({ error: 'productId and date are required' }, { status: 400 });
	}

	try {
		const response = await productGetCurrentAvailabilities({
			path: { productId },
			query: { date, timezone, staffMemberId, locationId },
		});

		if (response.error) {
			return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
		}

		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Availability API error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

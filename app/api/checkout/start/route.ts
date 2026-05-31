import { checkoutStart } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	try {
		const body = await request.json();
		const response = await checkoutStart({
			headers: { 'X-Cart-Id': cartId },
			body,
		});
		if (response.error) {
			return NextResponse.json(
				{ error: 'Failed to start checkout' },
				{ status: 400 },
			);
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Checkout start error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

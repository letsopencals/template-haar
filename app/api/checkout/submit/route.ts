import { checkoutSubmit } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	try {
		const body = await request.json();
		const response = await checkoutSubmit({
			headers: { 'X-Cart-Id': cartId },
			body,
		});
		if (response.error) {
			return NextResponse.json(
				{ error: 'Failed to submit checkout' },
				{ status: 400 },
			);
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Checkout submit error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

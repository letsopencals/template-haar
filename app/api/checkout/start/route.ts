import '@/lib/opencals';
import { CheckoutService } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	try {
		const body = await request.json();
		const token = await getAccessToken();
		const { data } = await CheckoutService.start({
			body,
			headers: { Authorization: `Bearer ${token ?? ''}`, 'X-Cart-Id': cartId },
		});
		return NextResponse.json(data);
	} catch (err) {
		console.error('Checkout start error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

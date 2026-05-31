import { checkoutSaveCustomer } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	try {
		const body = await request.json();
		const response = await checkoutSaveCustomer({
			headers: { 'X-Cart-Id': cartId },
			body,
		});
		if (response.error) {
			return NextResponse.json({ error: 'Failed to save customer' }, { status: 400 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Checkout save-customer error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

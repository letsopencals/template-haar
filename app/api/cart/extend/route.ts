import { cartExtendExpiration } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	try {
		const response = await cartExtendExpiration({ headers: { 'X-Cart-Id': cartId } });
		if (response.error) {
			return NextResponse.json({ error: 'Failed to extend cart' }, { status: 400 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Cart extend error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

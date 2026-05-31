import { cartCreateOrGet, cartGet } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';
	if (!cartId) {
		return NextResponse.json({ error: 'No cart ID' }, { status: 404 });
	}

	try {
		const response = await cartGet({ headers: { 'X-Cart-Id': cartId } });
		if (response.error) {
			return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Cart GET error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	try {
		const response = await cartCreateOrGet({ headers: { 'X-Cart-Id': cartId } });
		if (response.error) {
			return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Cart POST error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

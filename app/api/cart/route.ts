import '@/lib/opencals';
import { CartService } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';
	if (!cartId) {
		return NextResponse.json({ error: 'No cart ID' }, { status: 404 });
	}

	try {
		const token = await getAccessToken();
		const { data } = await CartService.get({ headers: { Authorization: `Bearer ${token ?? ''}`, 'X-Cart-Id': cartId } });
		return NextResponse.json(data);
	} catch (err) {
		console.error('Cart GET error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	try {
		const token = await getAccessToken();
		const { data } = await CartService.createOrGet({ headers: { Authorization: `Bearer ${token ?? ''}`, 'X-Cart-Id': cartId } });
		return NextResponse.json(data);
	} catch (err) {
		console.error('Cart POST error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

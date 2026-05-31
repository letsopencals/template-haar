import { cartRemoveItem } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ itemId: string }> },
) {
	const { itemId } = await params;
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	try {
		const response = await cartRemoveItem({
			path: { itemId },
			headers: { 'X-Cart-Id': cartId },
		});
		if (response.error) {
			return NextResponse.json({ error: 'Failed to remove item' }, { status: 400 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Cart remove item error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

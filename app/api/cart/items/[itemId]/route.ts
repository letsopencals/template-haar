import '@/lib/opencals';
import { CartService } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ itemId: string }> },
) {
	const { itemId } = await params;

	try {
		const token = await getAccessToken();
		const { data } = await CartService.removeItem({ path: { itemId }, headers: { Authorization: `Bearer ${token ?? ''}` } });
		return NextResponse.json(data);
	} catch (err) {
		console.error('Cart remove item error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

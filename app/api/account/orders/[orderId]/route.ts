import { orderFind } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ orderId: string }> },
) {
	const { orderId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const response = await orderFind({
			path: { orderId },
			headers: auth.headers,
		});
		if (response.error) {
			return NextResponse.json({ error: 'Order not found' }, { status: 404 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Order GET error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

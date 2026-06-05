import '@/lib/opencals';
import { OrderService } from '@opencals/storefront-sdk';
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
		const { data } = await OrderService.find({ path: { orderId }, headers: auth.headers });
		return NextResponse.json(data);
	} catch (err) {
		console.error('Order GET error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

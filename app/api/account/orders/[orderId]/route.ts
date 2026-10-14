import '@/lib/opencals';
import { OrderService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ orderId: string }> },
) {
	const { orderId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data } = await OrderService.find({ path: { orderId }, headers: auth.headers, throwOnError: true });
		return NextResponse.json(publicPayload(data));
	} catch (err) {
		return handleApiError(err);
	}
}

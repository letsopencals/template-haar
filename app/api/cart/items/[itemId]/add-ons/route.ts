import '@/lib/opencals';
import { CartService } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ itemId: string }> },
) {
	const { itemId } = await params;
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	if (!cartId) {
		return NextResponse.json({ error: 'Missing X-Cart-Id header' }, { status: 400 });
	}

	try {
		const body = await request.json();
		const { addOnId, quantity } = body ?? {};

		if (!addOnId) {
			return NextResponse.json({ error: 'Missing addOnId' }, { status: 400 });
		}

		const token = await getAccessToken();
		const { data } = await CartService.addAddOn({
			path: { cartItemId: itemId },
			body: {
				addOnId,
				...(typeof quantity === 'number' ? { quantity } : {}),
			},
			headers: {
				'X-Cart-Id': cartId,
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		});
		return NextResponse.json(data);
	} catch (err) {
		return handleApiError(err);
	}
}

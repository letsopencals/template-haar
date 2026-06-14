import '@/lib/opencals';
import { CartService } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ addOnItemId: string }> },
) {
	const { addOnItemId } = await params;

	try {
		const body = await request.json();
		const { quantity } = body ?? {};

		if (typeof quantity !== 'number') {
			return NextResponse.json({ error: 'Missing or invalid quantity' }, { status: 400 });
		}

		const token = await getAccessToken();
		const { data } = await CartService.updateAddOnQuantity({
			path: { cartAddOnItemId: addOnItemId },
			body: { quantity },
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
		return NextResponse.json(data);
	} catch (err) {
		return handleApiError(err);
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ addOnItemId: string }> },
) {
	const { addOnItemId } = await params;

	try {
		const token = await getAccessToken();
		const { data } = await CartService.removeAddOn({
			path: { cartAddOnItemId: addOnItemId },
			headers: token ? { Authorization: `Bearer ${token}` } : {},
		});
		return NextResponse.json(data);
	} catch (err) {
		return handleApiError(err);
	}
}

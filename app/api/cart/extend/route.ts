import '@/lib/opencals';
import { CartService } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	try {
		const token = await getAccessToken();
		const { data } = await CartService.extendExpiration({ headers: { Authorization: `Bearer ${token ?? ''}`, 'X-Cart-Id': cartId } });
		return NextResponse.json(data);
	} catch (err) {
		return handleApiError(err);
	}
}

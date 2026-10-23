import '@/lib/opencals';
import { CartService, OpencalsApiError } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-error-handler';

/**
 * Promo codes on the cart. Both return the updated cart. A rejected code keeps the API's status and passes on its
 * reason (`code`, e.g. CODE_EXPIRED) so the cart context can show the right message.
 */
async function cartHeaders(cartId: string) {
	const token = await getAccessToken();
	return { Authorization: `Bearer ${token ?? ''}`, 'X-Cart-Id': cartId };
}

function promoError(err: unknown) {
	if (err instanceof OpencalsApiError) {
		return NextResponse.json({ error: err.message, code: err.code }, { status: err.status });
	}
	return handleApiError(err);
}

export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';
	if (!cartId) {
		return NextResponse.json({ error: 'No cart ID' }, { status: 400 });
	}

	try {
		const body = await request.json();
		const { data } = await CartService.applyCode({
			body: { code: body.code },
			headers: await cartHeaders(cartId),
			throwOnError: true,
		});
		return NextResponse.json(data);
	} catch (err) {
		return promoError(err);
	}
}

export async function DELETE(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';
	if (!cartId) {
		return NextResponse.json({ error: 'No cart ID' }, { status: 400 });
	}

	try {
		const { data } = await CartService.removeCode({ headers: await cartHeaders(cartId), throwOnError: true });
		return NextResponse.json(data);
	} catch (err) {
		return promoError(err);
	}
}

import '@/lib/opencals';
import { CheckoutService } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';
	const language = request.nextUrl.searchParams.get('language') ?? 'en';

	try {
		const token = await getAccessToken();
		const { data } = await CheckoutService.getCartQuestions({
			path: { language },
			headers: { Authorization: `Bearer ${token ?? ''}`, 'X-Cart-Id': cartId },
		});
		return NextResponse.json(data);
	} catch (err) {
		console.error('Checkout questions error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

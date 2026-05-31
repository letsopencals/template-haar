import { checkoutGetCartQuestions } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';
	const language = request.nextUrl.searchParams.get('language') ?? 'en';

	try {
		const response = await checkoutGetCartQuestions({
			path: { language },
			headers: { 'X-Cart-Id': cartId },
		});
		if (response.error) {
			return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 400 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Checkout questions error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

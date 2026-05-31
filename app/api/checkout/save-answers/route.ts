import { checkoutSaveAnswers } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	try {
		const body = await request.json();
		const response = await checkoutSaveAnswers({
			headers: { 'X-Cart-Id': cartId },
			body,
		});
		if (response.error) {
			return NextResponse.json({ error: 'Failed to save answers' }, { status: 400 });
		}
		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error('Checkout save-answers error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

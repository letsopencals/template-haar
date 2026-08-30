import '@/lib/opencals';
import { PaymentService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
	try {
		// Cart-scoped: the provider list is amount-aware when the cart id is forwarded.
		const cartId = request.headers.get('X-Cart-Id') ?? '';
		const { data } = await PaymentService.getAvailableProviders(
			{ headers: { 'X-Cart-Id': cartId } },
		);
		return NextResponse.json(data);
	} catch (err) {
		return handleApiError(err);
	}
}

import '@/lib/opencals';
import { PaymentService } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET() {
	try {
		const { data } = await PaymentService.getSettings();
		return NextResponse.json(data);
	} catch (err) {
		return handleApiError(err);
	}
}

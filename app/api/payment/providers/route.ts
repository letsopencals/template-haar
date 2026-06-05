import '@/lib/opencals';
import { PaymentService } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const { data } = await PaymentService.getAvailableProviders();
		return NextResponse.json(data);
	} catch (err) {
		console.error('Payment providers error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

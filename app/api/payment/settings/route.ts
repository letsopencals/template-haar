import '@/lib/opencals';
import { PaymentService } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const { data } = await PaymentService.getSettings();
		return NextResponse.json(data);
	} catch (err) {
		console.error('Payment settings error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

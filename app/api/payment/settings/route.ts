import { paymentGetSettings } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const response = await paymentGetSettings();
		if (response.error) {
			return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Payment settings error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

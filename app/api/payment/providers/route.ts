import { paymentGetAvailableProviders } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const response = await paymentGetAvailableProviders();
		if (response.error) {
			return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Payment providers error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

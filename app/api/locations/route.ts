import '@/lib/opencals';
import { LocationService } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const { data } = await LocationService.list({ query: { take: 50 } });
		return NextResponse.json(data?.data ?? []);
	} catch (err) {
		console.error('Locations API error:', err);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

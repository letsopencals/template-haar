import { locationList } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		const response = await locationList({
			query: { take: 50 },
		});

		if (response.error) {
			return NextResponse.json(
				{ error: 'Failed to fetch locations' },
				{ status: 500 },
			);
		}

		return NextResponse.json(response.data?.data ?? []);
	} catch (err) {
		console.error('Locations API error:', err);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

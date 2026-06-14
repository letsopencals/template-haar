import '@/lib/opencals';
import { LocationService } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET() {
	try {
		const { data } = await LocationService.list({ query: { take: 50 } });
		return NextResponse.json(data?.data ?? []);
	} catch (err) {
		return handleApiError(err);
	}
}

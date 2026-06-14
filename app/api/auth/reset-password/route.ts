import '@/lib/opencals';
import { AuthService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		await AuthService.resetPassword({ body });
		return new NextResponse(null, { status: 204 });
	} catch (err) {
		return handleApiError(err);
	}
}

import '@/lib/opencals';
import { AuthService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		await AuthService.requestPasswordReset({ body });
	} catch {
		// Always return 204 to prevent email enumeration
	}

	return new NextResponse(null, { status: 204 });
}

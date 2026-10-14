import '@/lib/opencals';
import { AuthService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const { email } = await request.json();
		await AuthService.requestLoginCode({ body: { email } });
	} catch {
		// Always return 204 to prevent email enumeration
	}

	return new NextResponse(null, { status: 204 });
}

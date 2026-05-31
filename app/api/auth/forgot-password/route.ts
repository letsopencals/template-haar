import { authRequestPasswordReset } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const response = await authRequestPasswordReset({ body });

		if (response.error) {
			// Always return 204 to prevent email enumeration
		}

		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error('Forgot password error:', err);
		return new NextResponse(null, { status: 204 });
	}
}

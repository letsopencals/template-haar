import '@/lib/opencals';
import { AuthService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		await AuthService.resetPassword({ body });
		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error('Reset password error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

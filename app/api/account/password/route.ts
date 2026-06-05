import '@/lib/opencals';
import { SelfService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const body = await request.json();
		await SelfService.changePassword({ body, headers: auth.headers });
		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error('Password PUT error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

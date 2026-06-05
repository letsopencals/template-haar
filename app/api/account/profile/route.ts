import '@/lib/opencals';
import { SelfService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data } = await SelfService.getProfile({ headers: auth.headers });
		return NextResponse.json(data);
	} catch (err) {
		console.error('Profile GET error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const body = await request.json();
		const { data } = await SelfService.updateProfile({ body, headers: auth.headers });
		return NextResponse.json(data);
	} catch (err) {
		console.error('Profile PUT error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

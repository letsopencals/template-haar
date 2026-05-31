import { selfServiceGetProfile, selfServiceUpdateProfile } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const response = await selfServiceGetProfile({ headers: auth.headers });
		if (response.error) {
			return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 400 });
		}
		return NextResponse.json(response.data);
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
		const response = await selfServiceUpdateProfile({
			headers: auth.headers,
			body,
		});
		if (response.error) {
			return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Profile PUT error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

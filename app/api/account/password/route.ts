import { selfServiceChangePassword } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const body = await request.json();
		const response = await selfServiceChangePassword({
			headers: auth.headers,
			body,
		});
		if (response.error) {
			const err = response.error as { message?: string } | undefined;
			return NextResponse.json(
				{ error: err?.message ?? 'Failed to change password' },
				{ status: 400 },
			);
		}
		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error('Password PUT error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

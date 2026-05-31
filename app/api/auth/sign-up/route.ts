import { authSignUp } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const response = await authSignUp({ body });

		if (response.error) {
			const err = response.error as { message?: string; detail?: string } | undefined;
			return NextResponse.json(
				{ error: err?.message ?? err?.detail ?? 'Sign up failed' },
				{ status: 400 },
			);
		}

		return new NextResponse(null, { status: 204 });
	} catch (err) {
		console.error('Sign-up error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

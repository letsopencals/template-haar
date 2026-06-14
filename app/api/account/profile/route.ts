import '@/lib/opencals';
import { SelfService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET() {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data } = await SelfService.getProfile({ headers: auth.headers });
		return NextResponse.json(data);
	} catch (err) {
		return handleApiError(err);
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
		return handleApiError(err);
	}
}

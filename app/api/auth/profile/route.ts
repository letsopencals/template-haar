import '@/lib/opencals';
import { SelfService } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET() {
	const { headers, error } = await requireAuth();
	if (error) return error;

	try {
		const { data } = await SelfService.getProfile({ headers, throwOnError: true });
		return NextResponse.json({ id: data.id, email: data.email ?? undefined, firstName: data.firstName ?? undefined, lastName: data.lastName ?? undefined });
	} catch (err) {
		return handleApiError(err);
	}
}

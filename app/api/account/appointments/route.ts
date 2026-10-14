import '@/lib/opencals';
import { AppointmentService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';
import type { AppointmentListData } from '@opencals/storefront-sdk';

type ListQuery = NonNullable<AppointmentListData['query']>;
const ORDER_BY: ReadonlyArray<NonNullable<ListQuery['orderBy']>> = ['from', 'to', 'createdAt'];

export async function GET(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	const { searchParams } = request.nextUrl;
	const take = searchParams.get('take') ?? '20';
	const page = searchParams.get('page') ?? '1';
	// Optional sort (the diary asks for newest-first by start time).
	const orderBy = searchParams.get('orderBy') ?? undefined;
	const order = searchParams.get('order') ?? undefined;

	try {
		const { data } = await AppointmentService.list({
			query: {
				take: Number(take),
				page: Number(page),
				...(orderBy && (ORDER_BY as readonly string[]).includes(orderBy)
					? { orderBy: orderBy as ListQuery['orderBy'] }
					: {}),
				...(order === 'ASC' || order === 'DESC' ? { order } : {}),
			},
			headers: auth.headers,
			throwOnError: true,
		});
		return NextResponse.json(publicPayload(data));
	} catch (err) {
		return handleApiError(err);
	}
}

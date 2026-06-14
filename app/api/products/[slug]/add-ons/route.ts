import '@/lib/opencals';
import { ProductService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	const url = new URL(request.url);
	const locationId = url.searchParams.get('locationId') ?? undefined;
	const staffMemberId = url.searchParams.get('staffMemberId') ?? undefined;

	try {
		const { data } = await ProductService.listAddOnsBySlug({
			path: { slug },
			query: {
				...(locationId ? { locationId } : {}),
				...(staffMemberId ? { staffMemberId } : {}),
			},
		});
		return NextResponse.json(data ?? []);
	} catch (err) {
		return handleApiError(err);
	}
}

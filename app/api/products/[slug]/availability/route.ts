import '@/lib/opencals';
import { ProductService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	const { searchParams } = request.nextUrl;
	const date = searchParams.get('date');
	const timezone = searchParams.get('timezone') ?? undefined;
	const staffMemberId = searchParams.get('staffMemberId') ?? undefined;
	const locationId = searchParams.get('locationId') ?? undefined;

	if (!date) {
		return NextResponse.json(
			{ error: 'date query parameter is required' },
			{ status: 400 },
		);
	}

	try {
		// First get the product ID from slug
		const { data: product } = await ProductService.getBySlug({ path: { slug } });

		const { data } = await ProductService.getCurrentAvailabilities({
			path: { productId: product!.id },
			query: { date, timezone, staffMemberId, locationId },
		});

		return NextResponse.json(data);
	} catch (err) {
		return handleApiError(err);
	}
}

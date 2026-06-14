import '@/lib/opencals';
import { ProductService } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;

	try {
		const { data } = await ProductService.getBySlug({ path: { slug } });
		return NextResponse.json(data);
	} catch (err) {
		return handleApiError(err);
	}
}

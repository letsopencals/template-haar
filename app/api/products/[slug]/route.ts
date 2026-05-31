import { productGetBySlug } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;

	try {
		const response = await productGetBySlug({
			path: { slug },
		});

		if (response.error) {
			return NextResponse.json(
				{ error: 'Product not found' },
				{ status: 404 },
			);
		}

		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Product API error:', err);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

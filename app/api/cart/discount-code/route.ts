import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

const BACKEND_URL = process.env.OPENCALS_API_URL ?? 'https://api.opencals.com';
const API_KEY = process.env.OPENCALS_API_KEY ?? '';

function buildBackendHeaders(cartId: string): Record<string, string> {
	return {
		'Content-Type': 'application/json',
		'X-Api-Key': API_KEY,
		'X-Api-Version': '1',
		'X-Cart-Id': cartId,
	};
}

export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';
	if (!cartId) {
		return NextResponse.json({ error: 'No cart ID' }, { status: 400 });
	}

	try {
		const body = await request.json();
		const res = await fetch(`${BACKEND_URL}/storefront/cart/discount-code`, {
			method: 'POST',
			headers: buildBackendHeaders(cartId),
			body: JSON.stringify({ code: body.code }),
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (err) {
		return handleApiError(err);
	}
}

export async function DELETE(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';
	if (!cartId) {
		return NextResponse.json({ error: 'No cart ID' }, { status: 400 });
	}

	try {
		const res = await fetch(`${BACKEND_URL}/storefront/cart/discount-code`, {
			method: 'DELETE',
			headers: buildBackendHeaders(cartId),
		});

		const data = await res.json();
		return NextResponse.json(data, { status: res.status });
	} catch (err) {
		return handleApiError(err);
	}
}

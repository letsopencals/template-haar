import { OpencalsApiError } from '@opencals/storefront-sdk';
import { NextResponse } from 'next/server';

export function handleApiError(err: unknown, fallbackMessage = 'Internal server error') {
	if (err instanceof OpencalsApiError) {
		return NextResponse.json(
			{
				error: err.message,
				...(Object.keys(err.toFieldErrors()).length > 0 && { errors: err.toFieldErrors() }),
			},
			{ status: err.status },
		);
	}

	console.error(fallbackMessage, err);
	return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}

import '@/lib/opencals';
import { ProductService } from '@opencals/storefront-sdk';
import type { ProductGetCurrentAvailabilitiesData } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

// `excludeAppointmentId` (rescheduling: the appointment's own slot must not block itself) is in
// the API but only typed from SDK 0.3.16.
type AvailabilityQuery = ProductGetCurrentAvailabilitiesData['query'] & { excludeAppointmentId?: string };

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const productId = searchParams.get('productId');
	const date = searchParams.get('date');
	const timezone = searchParams.get('timezone') ?? undefined;
	const staffMemberId = searchParams.get('staffMemberId') ?? undefined;
	const locationId = searchParams.get('locationId') ?? undefined;
	const excludeAppointmentId = searchParams.get('excludeAppointmentId') ?? undefined;

	if (!productId || !date) {
		return NextResponse.json({ error: 'productId and date are required' }, { status: 400 });
	}

	const query: AvailabilityQuery = { date, timezone, staffMemberId, locationId, excludeAppointmentId };

	try {
		const { data } = await ProductService.getCurrentAvailabilities({
			path: { productId },
			query,
			throwOnError: true,
		});
		return NextResponse.json(data ?? []);
	} catch (err) {
		return handleApiError(err);
	}
}

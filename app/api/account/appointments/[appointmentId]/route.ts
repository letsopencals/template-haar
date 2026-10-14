import '@/lib/opencals';
import { AppointmentService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ appointmentId: string }> },
) {
	const { appointmentId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data } = await AppointmentService.find({ path: { appointmentId }, headers: auth.headers, throwOnError: true });
		return NextResponse.json(publicPayload(data));
	} catch (err) {
		return handleApiError(err);
	}
}

import '@/lib/opencals';
import { AppointmentService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ appointmentId: string }> },
) {
	const { appointmentId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const body = await request.json();
		const { data } = await AppointmentService.reschedule({
			path: { appointmentId },
			body: {
				slot: body.slot,
				notifyCustomer: true,
			},
			headers: auth.headers,
		});
		return NextResponse.json(data);
	} catch (err) {
		console.error('Appointment reschedule error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

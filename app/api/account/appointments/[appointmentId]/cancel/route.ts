import { appointmentCancel } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
	_request: NextRequest,
	{ params }: { params: Promise<{ appointmentId: string }> },
) {
	const { appointmentId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const response = await appointmentCancel({
			path: { appointmentId },
			headers: auth.headers,
			body: { notifyCustomer: true },
		});
		if (response.error) {
			const errData = response.error as { message?: string } | undefined;
			const message = errData?.message ?? 'Failed to cancel appointment';
			return NextResponse.json({ error: message }, { status: 400 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Appointment cancel error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

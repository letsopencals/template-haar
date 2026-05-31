import { appointmentFind } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ appointmentId: string }> },
) {
	const { appointmentId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const response = await appointmentFind({
			path: { appointmentId },
			headers: auth.headers,
		});
		if (response.error) {
			return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Appointment GET error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

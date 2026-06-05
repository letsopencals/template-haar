import '@/lib/opencals';
import { AppointmentService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	const { searchParams } = request.nextUrl;
	const take = searchParams.get('take') ?? '20';
	const page = searchParams.get('page') ?? '1';

	try {
		const { data } = await AppointmentService.list({
			query: { take: Number(take), page: Number(page) },
			headers: auth.headers,
		});
		return NextResponse.json(data);
	} catch (err) {
		console.error('Appointments error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

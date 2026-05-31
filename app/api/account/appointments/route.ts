import { appointmentList } from '@opencals/storefront-sdk';
import '@/lib/opencals';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	const { searchParams } = request.nextUrl;
	const take = searchParams.get('take') ?? '20';
	const page = searchParams.get('page') ?? '1';

	try {
		const response = await appointmentList({
			headers: auth.headers,
			query: { take: Number(take), page: Number(page) },
		});
		if (response.error) {
			return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 400 });
		}
		return NextResponse.json(response.data);
	} catch (err) {
		console.error('Appointments error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

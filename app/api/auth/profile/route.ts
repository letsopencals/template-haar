import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(_request: NextRequest) {
	const session = await auth();

	if (!session?.customer) {
		return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
	}

	return NextResponse.json(session.customer);
}

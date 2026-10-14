import '@/lib/opencals';
import { ProductService, type CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';

const HOUR = 3_600_000;

function localDate(ms: number, timezone: string): string {
	// en-CA formats as YYYY-MM-DD.
	return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(ms);
}

function toUtc(date: string, time: string): number {
	return Date.parse(`${date}T${time}Z`);
}

/**
 * Dates (YYYY-MM-DD in `timezone`) that have at least one bookable start across
 * the product's whole booking horizon. One merged-ranges call replaces a
 * per-day probe, so the day strip can mark open and closed days up front.
 * Only the date list is returned; the raw ranges nest staff and products.
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ slug: string }> },
) {
	const { slug } = await params;
	const { searchParams } = request.nextUrl;
	const timezone = searchParams.get('timezone') || 'UTC';
	const staffMemberId = searchParams.get('staffMemberId') ?? undefined;
	const locationId = searchParams.get('locationId') ?? undefined;

	try {
		new Intl.DateTimeFormat('en-CA', { timeZone: timezone });
	} catch {
		return NextResponse.json({ error: 'invalid timezone' }, { status: 400 });
	}

	try {
		const { data: product } = await ProductService.getBySlug({ path: { slug } });
		// No `duration` query: the API rejects it unless the product allows custom
		// durations. The product's own duration bounds the last start instead.
		const { data } = await ProductService.getCurrentAvailabilitiesMerged({
			path: { productId: product!.id },
			query: { timezone, staffMemberId, locationId },
		});
		const duration = product?.duration ?? 0;
		const ranges: CurrentAvailabilitySlot[] = Array.isArray(data) ? data : [];

		const now = Date.now();
		const dates = new Set<string>();
		for (const range of ranges) {
			const max = range.maxAttendees ?? 1;
			if ((range.attendees ?? 0) >= max) continue;
			const from = Math.max(toUtc(range.fromDate, range.fromTime), now);
			// The last start that still fits the lesson inside the range.
			const lastStart = toUtc(range.toDate, range.toTime) - (duration ? duration * 1000 : 1);
			if (!Number.isFinite(from) || lastStart < from) continue;
			// A local day is at least 23h long, so hourly steps never skip one.
			for (let t = from; t < lastStart; t += HOUR) dates.add(localDate(t, timezone));
			dates.add(localDate(lastStart, timezone));
		}

		return NextResponse.json({ dates: [...dates].sort() });
	} catch (err) {
		return handleApiError(err);
	}
}

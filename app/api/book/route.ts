import '@/lib/opencals';
import { AppointmentService, CartService } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const cartId = request.headers.get('X-Cart-Id') ?? '';

	try {
		const body = await request.json();
		const { slot, numberOfAttendees } = body;

		if (!slot?.productId || !slot?.fromDate || !slot?.fromTime || !slot?.toDate || !slot?.toTime) {
			return NextResponse.json(
				{ error: 'Invalid slot data' },
				{ status: 400 },
			);
		}

		const token = await getAccessToken();
		const authHeaders = { Authorization: `Bearer ${token ?? ''}` };

		// 1. Create appointment
		const { data: appointment } = await AppointmentService.create({
			body: {
				slot: {
					productId: slot.productId,
					fromDate: slot.fromDate,
					fromTime: slot.fromTime,
					toDate: slot.toDate,
					toTime: slot.toTime,
					staffMemberId: slot.staffMemberId ?? null,
					locationId: slot.locationId ?? null,
				},
				numberOfAttendees: numberOfAttendees ?? 1,
			},
			headers: authHeaders,
		});

		// 2. Create or get cart
		const { data: cart } = await CartService.createOrGet({ headers: { ...authHeaders, 'X-Cart-Id': cartId } });

		// 3. Add appointment to cart
		const { data: updatedCart } = await CartService.addItem({
			body: { appointmentId: appointment!.id },
			headers: { ...authHeaders, 'X-Cart-Id': cart!.id },
		});

		return NextResponse.json({
			appointment,
			cart: updatedCart,
		});
	} catch (err) {
		console.error('Book API error:', err);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

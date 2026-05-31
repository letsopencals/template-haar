import {
	appointmentCreate,
	cartCreateOrGet,
	cartAddItem,
} from '@opencals/storefront-sdk';
import '@/lib/opencals';
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

		// 1. Create appointment
		const appointmentResponse = await appointmentCreate({
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
		});

		if (appointmentResponse.error || !appointmentResponse.data) {
			console.error('Appointment creation failed:', appointmentResponse.error);
			return NextResponse.json(
				{ error: 'Failed to create appointment. The time slot may no longer be available.' },
				{ status: 422 },
			);
		}

		const appointment = appointmentResponse.data ;

		// 2. Create or get cart
		const cartResponse = await cartCreateOrGet({
			headers: { 'X-Cart-Id': cartId },
		});

		if (cartResponse.error || !cartResponse.data) {
			return NextResponse.json(
				{ error: 'Failed to create cart' },
				{ status: 500 },
			);
		}

		const cart = cartResponse.data ;

		// 3. Add appointment to cart
		const addItemResponse = await cartAddItem({
			headers: { 'X-Cart-Id': cart.id },
			body: { appointmentId: appointment.id },
		});

		if (addItemResponse.error) {
			return NextResponse.json(
				{ error: 'Failed to add to cart' },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			appointment,
			cart: addItemResponse.data,
		});
	} catch (err) {
		console.error('Book API error:', err);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		);
	}
}

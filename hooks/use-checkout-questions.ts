'use client';

import useSWR from 'swr';
import type { CheckoutQuestionResponse as CheckoutQuestion } from '@opencals/storefront-sdk';

/**
 * Checkout questions for the current cart. Cart-scoped (X-Cart-Id) and
 * independent of the customer-save step, so it loads in parallel via SWR
 * instead of chaining behind save-customer. Split out of checkout-context.
 */
export function useCheckoutQuestions(cartId: string | null): CheckoutQuestion[] {
	const { data } = useSWR<CheckoutQuestion[]>(
		cartId ? ['/api/checkout/questions?language=en', cartId] : null,
		([url, id]) =>
			fetch(url, { headers: { 'X-Cart-Id': id as string } }).then((res) => (res.ok ? res.json() : [])),
		{ revalidateOnFocus: false },
	);
	return Array.isArray(data) ? data : [];
}

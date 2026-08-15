import type { Cart } from '@opencals/storefront-sdk';

export type AppliedDiscount = {
	id: string;
	title: string;
	totalAmount: number;
	scope: 'line_item' | 'order';
	code?: string | null;
};

/** Cart extended with discount fields returned by the updated backend */
export type CartWithDiscounts = Cart & {
	appliedDiscountCode?: string | null;
	appliedDiscounts: AppliedDiscount[];
};

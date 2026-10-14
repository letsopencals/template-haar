import type { ProductListItemResponse } from '@opencals/storefront-sdk';

const PRIVATE_STAFF_KEYS = ['email', 'userId', 'refreshToken'] as const;

function isStaffLike(o: Record<string, unknown>): boolean {
	return 'refreshToken' in o || ('firstName' in o && 'email' in o && 'scheduleId' in o);
}

function scrub(value: unknown): unknown {
	if (Array.isArray(value)) return value.map(scrub);
	if (!value || typeof value !== 'object') return value;
	const src = value as Record<string, unknown>;
	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(src)) out[k] = scrub(v);
	if (isStaffLike(src)) for (const k of PRIVATE_STAFF_KEYS) if (k in out) out[k] = '';
	// Merchant-private note on appointments (orders, account views).
	if ('internalNote' in out) out.internalNote = null;
	return out;
}

/**
 * The SDK's product list shape nests staff members (on variants and on each
 * variant location) with `email`, `userId` and `refreshToken`. A booking UI only
 * needs names, photos and locations, so blank those fields before a product
 * reaches the browser (RSC props or `/api/products/*` JSON). Types are kept so
 * the existing components still compile.
 */
export function publicProduct<T extends ProductListItemResponse>(p: T): T {
	return scrub(p) as T;
}

/** Same scrub for any payload that nests staff or appointments (lists, collections, orders). */
export function publicPayload<T>(payload: T): T {
	return scrub(payload) as T;
}

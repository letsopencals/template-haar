'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Cart } from '@opencals/storefront-sdk';

const CART_ID_KEY = '@opencals/cart';

interface CartContextValue {
	cart: Cart | null;
	cartId: string | null;
	loading: boolean;
	/** Time remaining in seconds (null if no expiration) */
	timeRemaining: number | null;
	/** Fetch or create cart */
	refreshCart: () => Promise<void>;
	/** Set cart after booking (saves ID to localStorage) */
	setCart: (cart: Cart) => void;
	/** Remove an item from cart */
	removeItem: (itemId: string) => Promise<void>;
	/** Update an add-on item's quantity */
	updateAddOnQuantity: (addOnItemId: string, quantity: number) => Promise<void>;
	/** Remove an add-on item from a cart item */
	removeAddOnItem: (addOnItemId: string) => Promise<void>;
	/** Extend cart expiration */
	extendCart: () => Promise<void>;
	/** Clear cart state (after checkout) */
	clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error('useCart must be used within CartProvider');
	return ctx;
}

function getCartHeaders(cartId: string | null): Record<string, string> {
	return cartId ? { 'X-Cart-Id': cartId } : {};
}

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [cart, setCartState] = useState<Cart | null>(null);
	const [cartId, setCartId] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Load cart ID from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem(CART_ID_KEY);
		if (stored) {
			setCartId(stored);
		}
	}, []);

	// Fetch cart when cartId changes
	useEffect(() => {
		if (!cartId) return;

		async function fetchCart() {
			try {
				const res = await fetch('/api/cart', { headers: getCartHeaders(cartId) });
				if (res.ok) {
					const data = await res.json();
					setCartState(data);
				} else {
					// Cart expired or not found — clear
					localStorage.removeItem(CART_ID_KEY);
					setCartId(null);
					setCartState(null);
				}
			} catch {
				// silently fail
			}
		}

		fetchCart();
	}, [cartId]);

	// Expiration timer
	useEffect(() => {
		if (timerRef.current) clearInterval(timerRef.current);

		if (!cart?.expiresAt) {
			setTimeRemaining(null);
			return;
		}

		function tick() {
			const expiresAt = new Date(cart!.expiresAt!).getTime();
			const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
			setTimeRemaining(remaining);

			if (remaining <= 0 && timerRef.current) {
				clearInterval(timerRef.current);
			}
		}

		tick();
		timerRef.current = setInterval(tick, 1000);

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [cart?.expiresAt]);

	const refreshCart = useCallback(async () => {
		if (!cartId) return;
		setLoading(true);
		try {
			const res = await fetch('/api/cart', { headers: getCartHeaders(cartId) });
			if (res.ok) {
				setCartState(await res.json());
			}
		} finally {
			setLoading(false);
		}
	}, [cartId]);

	const setCart = useCallback((newCart: Cart) => {
		const id = newCart.id;
		if (id) {
			localStorage.setItem(CART_ID_KEY, id);
			setCartId(id);
		}
		setCartState(newCart);
	}, []);

	const removeItem = useCallback(
		async (itemId: string) => {
			if (!cartId) return;
			const res = await fetch(`/api/cart/items/${itemId}`, {
				method: 'DELETE',
				headers: getCartHeaders(cartId),
			});
			if (res.ok) {
				setCartState(await res.json());
			}
		},
		[cartId],
	);

	const updateAddOnQuantity = useCallback(
		async (addOnItemId: string, quantity: number) => {
			const res = await fetch(`/api/cart/add-ons/${addOnItemId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json', ...getCartHeaders(cartId) },
				body: JSON.stringify({ quantity }),
			});
			if (res.ok) {
				setCartState(await res.json());
			}
		},
		[cartId],
	);

	const removeAddOnItem = useCallback(
		async (addOnItemId: string) => {
			const res = await fetch(`/api/cart/add-ons/${addOnItemId}`, {
				method: 'DELETE',
				headers: getCartHeaders(cartId),
			});
			if (res.ok) {
				setCartState(await res.json());
			}
		},
		[cartId],
	);

	const extendCart = useCallback(async () => {
		if (!cartId) return;
		const res = await fetch('/api/cart/extend', {
			method: 'POST',
			headers: getCartHeaders(cartId),
		});
		if (res.ok) {
			setCartState(await res.json());
		}
	}, [cartId]);

	const clearCart = useCallback(() => {
		localStorage.removeItem(CART_ID_KEY);
		setCartId(null);
		setCartState(null);
		setTimeRemaining(null);
	}, []);

	return (
		<CartContext.Provider
			value={{
				cart,
				cartId,
				loading,
				timeRemaining,
				refreshCart,
				setCart,
				removeItem,
				updateAddOnQuantity,
				removeAddOnItem,
				extendCart,
				clearCart,
			}}
		>
			{children}
		</CartContext.Provider>
	);
}

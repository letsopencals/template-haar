'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';
import { CheckoutProvider, useCheckout } from '@/contexts/checkout-context';
import { CheckoutSteps } from '@/components/checkout/checkout-steps';
import { CustomerStep } from '@/components/checkout/customer-step';
import { QuestionsStep } from '@/components/checkout/questions-step';
import { PaymentSelectStep } from '@/components/checkout/payment-select-step';
import { PaymentStep } from '@/components/checkout/payment-step';
import { OrderSummary } from '@/components/checkout/order-summary';

export default function CheckoutPage() {
	return (
		<CheckoutProvider>
			<CheckoutContent />
		</CheckoutProvider>
	);
}

function CheckoutContent() {
	const { cart, cartId } = useCart();
	const { step, error, checkoutComplete, isExpired, setError } = useCheckout();

	if (checkoutComplete) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white pt-32">
				<div className="text-center">
					<div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-charcoal border-t-transparent" />
					<p className="mt-4 text-warm-gray">Redirecting to your order...</p>
				</div>
			</div>
		);
	}

	if (!cart || !cartId) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white pt-32">
				<div className="text-center">
					<p className="text-warm-gray">Your cart is empty.</p>
					<Link href="/services" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
						Browse Services
					</Link>
				</div>
			</div>
		);
	}

	return (
		<section className="bg-white pt-32 pb-20 lg:pt-40 lg:pb-32">
			<div className="mx-auto max-w-[1200px] px-6 lg:px-10">
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
					<Link
						href="/services"
						className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-warm-gray transition-colors hover:text-accent"
					>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
						</svg>
						Back to Services
					</Link>
					<h1 className="heading-display mt-6 text-4xl text-charcoal md:text-5xl">Checkout</h1>
				</motion.div>

				<div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
					{/* Left — Checkout steps */}
					<div className="lg:col-span-7">
						<CheckoutSteps />

						{/* Error banner */}
						{error && (
							<div className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
								{error}
								<button onClick={() => setError(null)} className="ml-2 font-medium underline">
									Dismiss
								</button>
							</div>
						)}

						{/* Cart expired */}
						{isExpired && (
							<div className="mb-6 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
								Your cart has expired.{' '}
								<Link href="/services" className="font-medium underline">
									Browse services
								</Link>{' '}
								to start a new booking.
							</div>
						)}

						<AnimatePresence mode="wait">
							{step === 'customer' && <CustomerStep />}
							{step === 'questions' && <QuestionsStep />}
							{step === 'payment-select' && <PaymentSelectStep />}
							{step === 'payment' && <PaymentStep />}
						</AnimatePresence>
					</div>

					{/* Right — Order Summary */}
					<div className="lg:col-span-5">
						<OrderSummary />
					</div>
				</div>
			</div>
		</section>
	);
}

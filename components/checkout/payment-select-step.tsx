'use client';

import { motion } from 'framer-motion';
import { useCheckout } from '@/contexts/checkout-context';

export function PaymentSelectStep() {
	const { providers, selectedProvider, questions, submitting, isExpired, setStep, handleStartCheckout } = useCheckout();

	return (
		<motion.div
			key="payment-select"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className="space-y-6"
		>
			<div className="border border-charcoal/10 p-6">
				<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Payment Method</h3>
				<div className="mt-6 space-y-3">
					{providers.length === 0 ? (
						<p className="text-sm text-warm-gray">No payment methods available. Please contact the salon.</p>
					) : (
						providers.map((provider) => (
							<button
								key={provider.name}
								onClick={() => handleStartCheckout(provider.name)}
								disabled={submitting || isExpired}
								className={`flex w-full items-center gap-4 border p-4 text-left transition-colors ${
									selectedProvider === provider.name
										? 'border-charcoal bg-cream/30'
										: 'border-charcoal/10 hover:border-charcoal/30'
								} disabled:opacity-50`}
							>
								<div className="flex h-10 w-10 items-center justify-center bg-cream text-charcoal">
									{provider.name === 'stripe' ? (
										<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
											<path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
										</svg>
									) : provider.name === 'cash' ? (
										<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
										</svg>
									) : (
										<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
										</svg>
									)}
								</div>
								<div>
									<p className="text-sm font-semibold text-charcoal">{provider.displayName}</p>
									{provider.description && <p className="text-xs text-warm-gray">{provider.description}</p>}
								</div>
								{provider.mode === 'test' && (
									<span className="ml-auto rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
										Test
									</span>
								)}
							</button>
						))
					)}
				</div>
			</div>

			<button
				type="button"
				onClick={() => setStep(questions.length > 0 ? 'questions' : 'customer')}
				className="w-full border border-charcoal/10 px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-charcoal transition-colors hover:bg-cream"
			>
				Back
			</button>
		</motion.div>
	);
}

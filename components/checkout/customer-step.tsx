'use client';

import { motion } from 'framer-motion';
import { useCheckout } from '@/contexts/checkout-context';

export function CustomerStep() {
	const { email, firstName, lastName, setEmail, setFirstName, setLastName, submitting, isExpired, handleSaveCustomer } =
		useCheckout();

	return (
		<motion.form
			key="customer"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			onSubmit={handleSaveCustomer}
			className="space-y-6"
		>
			<div className="border border-charcoal/10 p-6">
				<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Contact Information</h3>
				<div className="mt-6 space-y-4">
					<div>
						<label className="mb-1 block text-xs font-medium text-warm-gray">
							Email <span className="text-accent">*</span>
						</label>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="your@email.com"
							className="w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-charcoal"
						/>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<label className="mb-1 block text-xs font-medium text-warm-gray">First Name</label>
							<input
								type="text"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								placeholder="Jane"
								className="w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-charcoal"
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs font-medium text-warm-gray">Last Name</label>
							<input
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								placeholder="Smith"
								className="w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none transition-colors focus:border-charcoal"
							/>
						</div>
					</div>
				</div>
			</div>

			<button
				type="submit"
				disabled={submitting || !email || isExpired}
				className="flex w-full items-center justify-center gap-3 bg-charcoal px-8 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent disabled:opacity-50"
			>
				{submitting ? 'Saving...' : 'Continue'}
				{!submitting && (
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
					</svg>
				)}
			</button>
		</motion.form>
	);
}

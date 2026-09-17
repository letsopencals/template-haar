'use client';

import { motion } from 'framer-motion';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
						<Input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="your@email.com"
						/>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<label className="mb-1 block text-xs font-medium text-warm-gray">First Name</label>
							<Input
								type="text"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								placeholder="Jane"
							/>
						</div>
						<div>
							<label className="mb-1 block text-xs font-medium text-warm-gray">Last Name</label>
							<Input
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								placeholder="Smith"
							/>
						</div>
					</div>
				</div>
			</div>

			<Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting || !email || isExpired}>
				{submitting ? 'Saving...' : 'Continue'}
				{!submitting && (
					<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
					</svg>
				)}
			</Button>
		</motion.form>
	);
}

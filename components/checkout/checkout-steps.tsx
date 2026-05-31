'use client';

import { useCheckout, type CheckoutStep } from '@/contexts/checkout-context';

export function CheckoutSteps() {
	const { step, questions } = useCheckout();

	const steps: { key: CheckoutStep; label: string }[] = [
		{ key: 'customer', label: 'Your Info' },
		...(questions.length > 0 ? [{ key: 'questions' as CheckoutStep, label: 'Questions' }] : []),
		{ key: 'payment-select', label: 'Payment' },
		{ key: 'payment', label: 'Confirm' },
	];

	const currentStepIdx = steps.findIndex((s) => s.key === step);

	return (
		<div className="mb-8 flex items-center gap-3">
			{steps.map((s, i) => (
				<div key={s.key} className="flex items-center gap-3">
					<div
						className={`flex h-8 w-8 items-center justify-center text-xs font-semibold transition-colors ${
							step === s.key
								? 'bg-charcoal text-white'
								: i < currentStepIdx
									? 'bg-accent text-white'
									: 'bg-cream text-warm-gray'
						}`}
					>
						{i < currentStepIdx ? (
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						) : (
							i + 1
						)}
					</div>
					<span
						className={`hidden text-xs font-medium uppercase tracking-[0.15em] sm:block ${
							step === s.key ? 'text-charcoal' : 'text-warm-gray'
						}`}
					>
						{s.label}
					</span>
					{i < steps.length - 1 && <div className="h-px w-4 bg-charcoal/10 sm:w-8" />}
				</div>
			))}
		</div>
	);
}

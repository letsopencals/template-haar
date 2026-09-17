'use client';

import { motion } from 'framer-motion';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';

export function QuestionsStep() {
	const { questions, answers, setAnswers, submitting, isExpired, setStep, handleSaveAnswers } = useCheckout();

	return (
		<motion.form
			key="questions"
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			onSubmit={handleSaveAnswers}
			className="space-y-6"
		>
			<div className="border border-charcoal/10 p-6">
				<h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal">Additional Information</h3>
				<div className="mt-6 space-y-5">
					{[...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((q) => {
						const translation = q.translations?.[0];
						const title = translation?.title ?? q.internalName;
						const description = translation?.description;
						const options = translation?.options;
						return (
							<div key={q.id}>
								<label className="mb-1 block text-xs font-medium text-warm-gray">
									{title} {q.required && <span className="text-accent">*</span>}
								</label>
								{description && <p className="mb-2 text-xs text-warm-gray/70">{description}</p>}
								{q.type === 'dropdown' && options ? (
									<select
										required={q.required}
										value={answers[q.id] ?? ''}
										onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
										className="w-full border border-charcoal/10 bg-white px-4 py-3 text-sm text-charcoal outline-none focus:border-charcoal"
									>
										<option value="">Select...</option>
										{options.map((o) => (
											<option key={o} value={o}>
												{o}
											</option>
										))}
									</select>
								) : q.type === 'multi-line-text-field' ? (
									<Textarea
										required={q.required}
										value={answers[q.id] ?? ''}
										onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
										rows={3}
									/>
								) : q.type === 'checkbox' ? (
									<label className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={answers[q.id] === 'true'}
											onChange={(e) =>
												setAnswers((prev) => ({ ...prev, [q.id]: e.target.checked ? 'true' : 'false' }))
											}
											className="h-4 w-4 accent-accent"
										/>
										<span className="text-sm text-charcoal">Yes</span>
									</label>
								) : (
									<Input
										type="text"
										required={q.required}
										value={answers[q.id] ?? ''}
										onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>

			<div className="flex gap-4">
				<Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep('customer')}>
					Back
				</Button>
				<Button type="submit" variant="primary" size="lg" className="flex-1" disabled={submitting || isExpired}>
					{submitting ? 'Saving...' : 'Continue'}
				</Button>
			</div>
		</motion.form>
	);
}

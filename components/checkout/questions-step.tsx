'use client';

import { useMemo } from 'react';
import type { CheckoutQuestionResponse as CheckoutQuestion } from '@opencals/storefront-sdk';
import { useCheckout } from '@/contexts/checkout-context';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Field } from './field';
import { QUESTIONS_FORM_ID } from './form-ids';

const SELECT_CLASS =
	'w-full appearance-none rounded-none border border-charcoal/15 bg-white/70 bg-[length:12px] bg-[right_1rem_center] bg-no-repeat px-4 py-3.5 pr-10 text-[0.95rem] text-charcoal outline-none transition-colors hover:border-charcoal/30 focus:border-charcoal focus:bg-white';
// Hairline chevron as the select caret.
const SELECT_STYLE = {
	backgroundImage:
		"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%231a1a1a' stroke-width='1.2'%3E%3Cpath d='M2 4.5l4 4 4-4'/%3E%3C/svg%3E\")",
} as const;

/** 02 — A few questions. Same field types and required flags as before. */
export function QuestionsStep() {
	const { questions, submitting, isExpired, handleSaveAnswers } = useCheckout();
	const sorted = useMemo(() => [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [questions]);

	return (
		<form id={QUESTIONS_FORM_ID} onSubmit={handleSaveAnswers} className="space-y-7">
			{sorted.map((q) => (
				<QuestionField key={q.id} question={q} />
			))}
			<Button type="submit" variant="primary" size="lg" className="max-lg:hidden" disabled={submitting || isExpired}>
				{submitting ? 'Saving…' : 'Continue'}
				{submitting ? null : <span aria-hidden>→</span>}
			</Button>
		</form>
	);
}

function QuestionField({ question: q }: { question: CheckoutQuestion }) {
	const { answers, setAnswers } = useCheckout();
	const translation = q.translations?.[0];
	const title = translation?.title ?? q.internalName;
	const description = translation?.description;
	const options = translation?.options;
	const id = `question-${q.id}`;
	const value = answers[q.id] ?? '';
	const set = (v: string) => setAnswers((prev) => ({ ...prev, [q.id]: v }));
	const describedBy = description ? `${id}-hint` : undefined;

	if (q.type === 'checkbox') {
		return (
			<fieldset>
				<legend className="eyebrow mb-2.5 text-[0.62rem] text-warm-gray">
					{title}
					{q.required ? (
						<span className="ml-1 text-accent" aria-hidden>
							*
						</span>
					) : null}
				</legend>
				{description ? <p className="-mt-1 mb-2.5 text-xs text-warm-gray">{description}</p> : null}
				<label htmlFor={id} className="inline-flex cursor-pointer items-center gap-3 text-sm text-charcoal">
					<input
						id={id}
						type="checkbox"
						checked={value === 'true'}
						onChange={(e) => set(e.target.checked ? 'true' : 'false')}
						className="h-4 w-4 accent-accent"
					/>
					Yes
				</label>
			</fieldset>
		);
	}

	return (
		<Field htmlFor={id} label={title} required={q.required} hint={description}>
			{q.type === 'dropdown' && options ? (
				<select
					id={id}
					required={q.required}
					value={value}
					onChange={(e) => set(e.target.value)}
					aria-describedby={describedBy}
					className={SELECT_CLASS}
					style={SELECT_STYLE}
				>
					<option value="">Select…</option>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
			) : q.type === 'multi-line-text-field' ? (
				<Textarea
					id={id}
					required={q.required}
					value={value}
					onChange={(e) => set(e.target.value)}
					aria-describedby={describedBy}
					rows={3}
				/>
			) : (
				<Input
					id={id}
					type="text"
					required={q.required}
					value={value}
					onChange={(e) => set(e.target.value)}
					aria-describedby={describedBy}
				/>
			)}
		</Field>
	);
}

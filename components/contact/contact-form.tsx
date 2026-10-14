'use client';

import { useId, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Seal } from '@/components/motifs/seal';
import { DURATION, EASE_OUT } from '@/components/motion/easing';

const SWAP_IN = { opacity: 1, y: 0 } as const;
const SWAP_OUT = { opacity: 0, y: 16 } as const;
const SWAP_TRANSITION: Transition = { duration: DURATION.base, ease: EASE_OUT };

interface FieldProps {
	label: string;
	name: string;
	type?: string;
	placeholder?: string;
	required?: boolean;
	autoComplete?: string;
	multiline?: boolean;
}

const FIELD_CLASS =
	'peer mt-2 w-full resize-none border-b border-line-strong bg-transparent py-3 text-[16px] text-charcoal outline-none placeholder:text-warm-gray-light';

/** Underline field: a hairline that an accent rule sweeps across on focus. */
function Field({ label, name, type = 'text', placeholder, required, autoComplete, multiline }: FieldProps) {
	const id = useId();
	return (
		<div className="group relative">
			<label htmlFor={id} className="eyebrow text-warm-gray transition-colors duration-300 group-focus-within:text-accent">
				{label}
				{required ? <span aria-hidden> *</span> : null}
			</label>
			{multiline ? (
				<textarea id={id} name={name} rows={4} placeholder={placeholder} required={required} className={FIELD_CLASS} />
			) : (
				<input id={id} name={name} type={type} placeholder={placeholder} required={required} autoComplete={autoComplete} className={FIELD_CLASS} />
			)}
			<span
				aria-hidden
				className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-accent transition-transform duration-500 ease-[var(--ease-expo)] group-focus-within:scale-x-100"
			/>
		</div>
	);
}

/**
 * Visual-only enquiry form (the template has no contact endpoint): validates
 * natively, then swaps to a sealed "received" note. Nothing is sent.
 */
export function ContactForm() {
	const [sentTo, setSentTo] = useState<string | null>(null);

	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const first = new FormData(e.currentTarget).get('firstName');
		setSentTo(typeof first === 'string' && first.trim() ? first.trim() : 'friend');
	};

	return (
		<div className="border border-line bg-paper p-7 md:p-10 lg:p-12">
			<AnimatePresence mode="wait" initial={false}>
				{sentTo ? (
					<motion.div key="sent" role="status" initial={SWAP_OUT} animate={SWAP_IN} exit={SWAP_OUT} transition={SWAP_TRANSITION} className="flex min-h-[28rem] flex-col items-start justify-center">
						<Seal motion="stamp" ring="Received · With thanks · " center="H." size={112} className="text-accent" />
						<h2 className="display-md mt-10 text-charcoal">
							Thank you, <em className="text-accent">{sentTo}.</em>
						</h2>
						<p className="mt-5 max-w-sm text-[15px] leading-relaxed text-charcoal/70">
							Your note is with the front desk. We usually reply within a working day.
						</p>
						<button type="button" onClick={() => setSentTo(null)} className="link-underline eyebrow mt-10 text-charcoal">
							Write another
						</button>
					</motion.div>
				) : (
					<motion.form key="form" onSubmit={onSubmit} initial={SWAP_OUT} animate={SWAP_IN} exit={SWAP_OUT} transition={SWAP_TRANSITION}>
						<span className="eyebrow text-warm-gray">
							<span className="tabular">Nº 03</span> — Correspondence
						</span>
						<h2 className="display-md mt-5 text-charcoal">
							Send us <em className="text-accent">a note</em>
						</h2>
						<p className="mt-4 max-w-md text-[15px] text-charcoal/65">A question, a special occasion, or a chair for a group: we&apos;d love to hear.</p>
						<div className="mt-10 space-y-8">
							<div className="grid gap-8 sm:grid-cols-2">
								<Field label="First name" name="firstName" placeholder="Jane" autoComplete="given-name" required />
								<Field label="Last name" name="lastName" placeholder="Doe" autoComplete="family-name" />
							</div>
							<div className="grid gap-8 sm:grid-cols-2">
								<Field label="Email" name="email" type="email" placeholder="jane@example.com" autoComplete="email" required />
								<Field label="Phone" name="phone" type="tel" placeholder="+1 (212) 555-0000" autoComplete="tel" />
							</div>
							<Field label="Message" name="message" placeholder="Tell us what you have in mind…" required multiline />
						</div>
						<Button type="submit" size="lg" fullWidth className="mt-10">
							Send the note <span aria-hidden>→</span>
						</Button>
					</motion.form>
				)}
			</AnimatePresence>
		</div>
	);
}

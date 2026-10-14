'use client';

import { memo } from 'react';
import { clsx } from 'clsx';
import type { AddOnListItemResponse as AddOn } from '@opencals/storefront-sdk';
import { formatPrice, getProductImage } from '@/lib/format';
import { SafeImage } from '@/components/ui/safe-image';

interface FinishingTouchesProps {
	addOns: AddOn[];
	loading: boolean;
	selected: Map<string, number>;
	bookedDurationUnits: number;
	currency: string;
	onChange: (addOnId: string, quantity: number) => void;
	maxAttendees: number;
	seatsLeft: number;
	attendees: number;
	onAttendeesChange: (n: number) => void;
}

/** Section 04: optional treatments (toggle, or a stepper when countable) and, for group services, how many. */
export function FinishingTouches({
	addOns,
	loading,
	selected,
	bookedDurationUnits,
	currency,
	onChange,
	maxAttendees,
	seatsLeft,
	attendees,
	onAttendeesChange,
}: FinishingTouchesProps) {
	return (
		<div className="space-y-9">
			{maxAttendees > 1 ? (
				<div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
					<div>
						<p className="font-display text-xl text-charcoal">How many of you?</p>
						<p className="text-xs text-warm-gray">
							{seatsLeft} {seatsLeft === 1 ? 'place' : 'places'} left at this time
						</p>
					</div>
					<Stepper
						value={attendees}
						min={1}
						max={seatsLeft}
						onChange={onAttendeesChange}
						label="guests"
					/>
				</div>
			) : null}

			<div>
				<p className="eyebrow text-warm-gray">Treatments to add — optional</p>
				{loading ? (
					<div className="mt-4 grid gap-2 sm:grid-cols-2">
						<div className="h-24 animate-pulse bg-cream-dark" />
						<div className="h-24 animate-pulse bg-cream-dark" />
					</div>
				) : addOns.length === 0 ? (
					<p className="mt-3 font-display text-lg italic text-warm-gray">Nothing to add for this service — it&rsquo;s complete as it is.</p>
				) : (
					<ul className="mt-4 grid gap-2 sm:grid-cols-2">
						{addOns.map((addOn) => (
							<AddOnCard
								key={addOn.id}
								addOn={addOn}
								qty={selected.get(addOn.id) ?? 0}
								units={bookedDurationUnits}
								currency={currency}
								onChange={onChange}
							/>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}

const AddOnCard = memo(function AddOnCard({
	addOn,
	qty,
	units,
	currency,
	onChange,
}: {
	addOn: AddOn;
	qty: number;
	units: number;
	currency: string;
	onChange: (addOnId: string, quantity: number) => void;
}) {
	const isDuration = addOn.durationMultiplied;
	// A treatment can be taken several times when it isn't priced by the booked length.
	const countable = !isDuration && (addOn.maxQuantity == null || addOn.maxQuantity > 1);
	const active = qty > 0;
	const image = getProductImage(addOn);
	const title = addOn.title ?? addOn.slug;

	return (
		<li
			className={clsx(
				'flex gap-4 border p-4 transition-colors duration-300',
				active ? 'border-charcoal bg-cream' : 'border-line bg-paper',
			)}
		>
			{image ? (
				<span className="arch-sm image-placeholder relative h-16 w-12 shrink-0">
					<SafeImage src={image} alt="" fill sizes="48px" className="object-cover" />
				</span>
			) : null}
			<div className="flex min-w-0 flex-1 flex-col">
				<p className="font-display text-lg leading-tight text-charcoal">{title}</p>
				{addOn.description ? <p className="mt-1 line-clamp-2 text-xs text-warm-gray">{addOn.description}</p> : null}
				<div className="mt-auto flex items-end justify-between gap-3 pt-3">
					<p className="tabular text-sm text-charcoal">
						{isDuration ? (
							<>
								{formatPrice(addOn.price * units, currency)}
								<span className="ml-1 text-xs text-warm-gray">
									({units} × {formatPrice(addOn.price, currency)})
								</span>
							</>
						) : (
							<>+{formatPrice(addOn.price, currency)}</>
						)}
					</p>
					{countable && active ? (
						<Stepper
							value={qty}
							min={0}
							max={addOn.maxQuantity ?? 99}
							onChange={(n) => onChange(addOn.id, n)}
							label={title}
						/>
					) : (
						<button
							type="button"
							aria-pressed={active}
							onClick={() => onChange(addOn.id, active ? 0 : 1)}
							className={clsx(
								'eyebrow border px-3.5 py-2 text-[0.62rem] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-accent',
								active ? 'border-charcoal bg-charcoal text-cream' : 'border-line-strong text-charcoal hover:border-charcoal',
							)}
						>
							{active ? 'Added ✓' : 'Add'}
							<span className="sr-only"> {title}</span>
						</button>
					)}
				</div>
			</div>
		</li>
	);
});

function Stepper({
	value,
	min,
	max,
	onChange,
	label,
}: {
	value: number;
	min: number;
	max: number;
	onChange: (n: number) => void;
	label: string;
}) {
	return (
		<div className="flex items-center border border-line-strong" role="group" aria-label={label}>
			<button
				type="button"
				onClick={() => onChange(value - 1)}
				disabled={value <= min}
				aria-label={`Fewer ${label}`}
				className="flex h-9 w-9 items-center justify-center text-charcoal transition-colors hover:bg-cream-dark disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-accent"
			>
				<span aria-hidden>&minus;</span>
			</button>
			<span className="tabular w-8 text-center text-sm text-charcoal" aria-live="polite">
				{value}
			</span>
			<button
				type="button"
				onClick={() => onChange(value + 1)}
				disabled={value >= max}
				aria-label={`More ${label}`}
				className="flex h-9 w-9 items-center justify-center text-charcoal transition-colors hover:bg-cream-dark disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-accent"
			>
				<span aria-hidden>+</span>
			</button>
		</div>
	);
}

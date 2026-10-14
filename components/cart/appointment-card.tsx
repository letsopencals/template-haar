'use client';

import { memo, useState } from 'react';
import { clsx } from 'clsx';
import { SafeImage } from '@/components/ui/safe-image';
import { formatPrice } from '@/lib/format';
import { type CartAddOnLine, type CartLine, useAppointmentFormat } from './cart-line';

interface AppointmentCardProps {
	line: CartLine;
	/** 0-based position, printed as "Nº 01". */
	index: number;
	currency: string | undefined;
	/** Drawer: qty controls + remove. Checkout stack: read-only. */
	editable?: boolean;
	onRemove?: (itemId: string) => Promise<void>;
	onAddOnQuantity?: (addOnItemId: string, quantity: number) => Promise<void>;
	onAddOnRemove?: (addOnItemId: string) => Promise<void>;
	className?: string;
}

/**
 * A mini appointment card — the printed "card" the booking composer fills in:
 * arched service plate with the stylist's portrait tucked in, service + option,
 * date and time in mono, finishing touches, price.
 */
export const AppointmentCard = memo(function AppointmentCard({
	line,
	index,
	currency,
	editable = false,
	onRemove,
	onAddOnQuantity,
	onAddOnRemove,
	className,
}: AppointmentCardProps) {
	const fmt = useAppointmentFormat();
	const [confirming, setConfirming] = useState(false);
	const [removing, setRemoving] = useState(false);
	const discounted = line.discountedPrice < line.price;

	const handleRemove = async () => {
		if (!onRemove) return;
		setRemoving(true);
		try {
			await onRemove(line.id);
		} finally {
			setRemoving(false);
			setConfirming(false);
		}
	};

	return (
		<article
			aria-label={`${line.title}${line.option ? `, ${line.option}` : ''}`}
			className={clsx('relative border border-line bg-paper', removing && 'opacity-50', className)}
		>
			<div className="flex gap-4 p-4 sm:p-5">
				<div className="relative shrink-0">
					<div className="arch-sm image-placeholder relative h-[88px] w-[66px]">
						<SafeImage src={line.image} alt="" fill sizes="66px" className="object-cover" />
					</div>
					{line.staffImage ? (
						<div className="arch-sm image-placeholder absolute -right-2.5 -bottom-1.5 h-9 w-7 ring-2 ring-paper">
							<SafeImage src={line.staffImage} alt="" fill sizes="28px" className="object-cover object-top" />
						</div>
					) : null}
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-3">
						<p className="tabular text-[0.7rem] text-brass">Nº {String(index + 1).padStart(2, '0')}</p>
						<p className="tabular text-right text-sm text-charcoal">
							{discounted ? (
								<>
									<span className="mr-1.5 text-xs text-warm-gray line-through">{formatPrice(line.price, currency)}</span>
									{formatPrice(line.discountedPrice, currency)}
								</>
							) : (
								formatPrice(line.price, currency)
							)}
						</p>
					</div>
					<h3 className="mt-1 font-display text-[1.35rem] leading-[1.1] text-charcoal">{line.title}</h3>
					<p className="mt-1 truncate text-[0.8rem] text-warm-gray">
						{line.option ? <span className="italic-display text-[0.95rem] text-charcoal">{line.option}</span> : null}
						{line.option && line.staffName ? <span aria-hidden> · </span> : null}
						{line.staffName ? <>with {line.staffName}</> : null}
					</p>
				</div>
			</div>

			<div className="perforation mx-4 sm:mx-5" aria-hidden />

			<dl className="grid grid-cols-2 gap-x-4 px-4 py-3 sm:px-5">
				<div>
					<dt className="eyebrow text-[0.6rem] text-warm-gray">Date</dt>
					<dd className="tabular mt-1 text-[0.82rem] text-charcoal">{fmt.date(line.from) || '—'}</dd>
				</div>
				<div>
					<dt className="eyebrow text-[0.6rem] text-warm-gray">Time</dt>
					<dd className="tabular mt-1 text-[0.82rem] text-charcoal">{fmt.time(line.from, line.to) || '—'}</dd>
				</div>
				{line.locationTitle ? (
					<div className="col-span-2 mt-2.5">
						<dt className="sr-only">Salon</dt>
						<dd className="truncate text-[0.78rem] text-warm-gray">{line.locationTitle}</dd>
					</div>
				) : null}
			</dl>

			{line.addOns.length > 0 ? (
				<div className="border-t border-line px-4 py-3 sm:px-5">
					<p className="eyebrow text-[0.6rem] text-warm-gray">Finishing touches</p>
					<ul className="mt-2 space-y-2">
						{line.addOns.map((ao) => (
							<AddOnRow
								key={ao.id}
								addOn={ao}
								currency={currency}
								editable={editable}
								onQuantity={onAddOnQuantity}
								onRemove={onAddOnRemove}
							/>
						))}
					</ul>
				</div>
			) : null}

			{editable && onRemove ? (
				<div className="flex min-h-11 items-center justify-end gap-4 border-t border-line px-4 sm:px-5">
					{confirming ? (
						<>
							<span className="mr-auto text-xs text-charcoal" role="status">
								Release this chair?
							</span>
							<button
								type="button"
								onClick={() => setConfirming(false)}
								className="text-xs text-warm-gray hover:text-charcoal focus-visible:outline-2 focus-visible:outline-accent"
							>
								Keep
							</button>
							<button
								type="button"
								onClick={handleRemove}
								disabled={removing}
								className="eyebrow text-[0.62rem] text-red-700 hover:text-red-800 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
							>
								{removing ? 'Removing…' : 'Yes, remove'}
							</button>
						</>
					) : (
						<button
							type="button"
							onClick={() => setConfirming(true)}
							className="eyebrow text-[0.62rem] text-warm-gray transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-accent"
						>
							Remove
						</button>
					)}
				</div>
			) : null}
		</article>
	);
});

interface AddOnRowProps {
	addOn: CartAddOnLine;
	currency: string | undefined;
	editable: boolean;
	onQuantity?: (addOnItemId: string, quantity: number) => Promise<void>;
	onRemove?: (addOnItemId: string) => Promise<void>;
}

const QTY_BTN =
	'flex h-7 w-7 items-center justify-center border border-charcoal/20 text-charcoal transition-colors hover:border-charcoal hover:bg-cream focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-30';

function AddOnRow({ addOn, currency, editable, onQuantity, onRemove }: AddOnRowProps) {
	const [pending, setPending] = useState(false);
	const run = async (fn: () => Promise<void>) => {
		setPending(true);
		try {
			await fn();
		} finally {
			setPending(false);
		}
	};
	const showQty = editable && !addOn.durationMultiplied && onQuantity;

	return (
		<li className={clsx('flex items-center gap-3 text-[0.82rem]', pending && 'opacity-60')}>
			<span className="min-w-0 flex-1 truncate text-charcoal">
				{addOn.title}
				{!showQty && addOn.quantity > 1 ? <span className="tabular text-warm-gray"> × {addOn.quantity}</span> : null}
			</span>
			{showQty ? (
				<span className="flex items-center" role="group" aria-label={`${addOn.title} quantity`}>
					<button
						type="button"
						className={QTY_BTN}
						disabled={pending}
						onClick={() => run(() => onQuantity(addOn.id, addOn.quantity - 1))}
						aria-label={`Fewer ${addOn.title}`}
					>
						<svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
							<path d="M2 6h8" />
						</svg>
					</button>
					<span className="tabular w-7 text-center text-xs" aria-live="polite">
						{addOn.quantity}
					</span>
					<button
						type="button"
						className={QTY_BTN}
						disabled={pending || addOn.atMax}
						onClick={() => run(() => onQuantity(addOn.id, addOn.quantity + 1))}
						aria-label={`More ${addOn.title}`}
					>
						<svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
							<path d="M2 6h8M6 2v8" />
						</svg>
					</button>
				</span>
			) : null}
			<span className="tabular w-16 text-right text-charcoal">{formatPrice(addOn.price, currency)}</span>
			{editable && onRemove ? (
				<button
					type="button"
					disabled={pending}
					onClick={() => run(() => onRemove(addOn.id))}
					aria-label={`Remove ${addOn.title}`}
					className="-mr-1.5 flex h-7 w-7 items-center justify-center text-warm-gray transition-colors hover:text-red-700 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
				>
					<svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.4} aria-hidden>
						<path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
					</svg>
				</button>
			) : null}
		</li>
	);
}

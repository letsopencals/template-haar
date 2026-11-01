'use client';

import moment from 'moment-timezone';
import type { PaymentInstructions, PaymentProviderName } from '@opencals/storefront-sdk';
import { useSettings } from '@/contexts/settings-context';
import { buttonClasses } from '@/components/ui/button';

interface SettleUpProps {
	/** Provider name of the method chosen at checkout (when still known). */
	provider: PaymentProviderName | null;
	instructions: PaymentInstructions | null;
	dueAt: string | null;
	/** Order number, the transfer reference. */
	reference: string | null;
}

const safeLink = (url: string | null | undefined): url is string => !!url && url.startsWith('https://');

/**
 * "Settling up": how to pay a booking placed without a card. A bank transfer shows the salon's account, an
 * invoice its pay link, pay-at-the-salon a note for the desk. When the details are no longer at hand (another
 * tab, storage cleared) it points to the email — never to the desk.
 */
export function SettleUp({ provider, instructions, dueAt, reference }: SettleUpProps) {
	const { settings, timeFormat } = useSettings();
	const timezone = settings?.settings?.timezone || moment.tz.guess();
	const method = instructions?.provider ?? provider;
	const bank = instructions?.bankDetails ?? null;
	const due = dueAt ? moment.utc(dueAt).tz(timezone).format(`dddd D MMMM, ${timeFormat === '24H' ? 'HH:mm' : 'h:mm A'}`) : null;

	let title = (
		<>
			Settling <em>up</em>
		</>
	);
	let body: React.ReactNode = <p className="text-sm leading-relaxed text-warm-gray">The payment details are in your confirmation email.</p>;

	if (method === 'cash') {
		title = (
			<>
				Pay at the <em>salon</em>
			</>
		);
		body = <p className="text-sm leading-relaxed text-warm-gray">Settle up at the desk after your visit, by card or cash.</p>;
	} else if (method === 'stripe_invoice') {
		title = (
			<>
				Your <em>invoice</em>
			</>
		);
		body = safeLink(instructions?.hostedInvoiceUrl) ? (
			<>
				<p className="text-sm leading-relaxed text-warm-gray">Pay online by card or bank. A copy is in your inbox.</p>
				<a
					href={instructions.hostedInvoiceUrl}
					target="_blank"
					rel="noopener noreferrer"
					className={buttonClasses({ variant: 'primary', size: 'md', className: 'mt-6' })}
				>
					Pay invoice <span aria-hidden>↗</span>
					<span className="sr-only"> (opens in a new tab)</span>
				</a>
			</>
		) : (
			<p className="text-sm leading-relaxed text-warm-gray">Your invoice is on its way by email, with a link to pay it online.</p>
		);
	} else if (method === 'bank_transfer') {
		title = (
			<>
				By bank <em>transfer</em>
			</>
		);
		const rows = [
			['Account name', bank?.accountName],
			['Bank', bank?.bankName],
			['IBAN / account', bank?.iban],
			['SWIFT / BIC', bank?.swift],
			['Reference', reference],
		].filter((r): r is [string, string] => !!r[1]);
		body =
			bank && (bank.iban || bank.accountName) ? (
				<>
					<p className="text-sm leading-relaxed text-warm-gray">Transfer the total to the salon&rsquo;s account. The same details are in your email.</p>
					<dl className="mt-5 divide-y divide-line border-y border-line">
						{rows.map(([term, value]) => (
							<div key={term} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
								<dt className="eyebrow text-[0.6rem] text-warm-gray">{term}</dt>
								<dd className="tabular break-all text-right text-[0.95rem] text-charcoal">{value}</dd>
							</div>
						))}
					</dl>
				</>
			) : (
				<p className="text-sm leading-relaxed text-warm-gray">
					The salon&rsquo;s bank details are in your confirmation email{reference ? `; use ${reference} as the reference` : ''}.
				</p>
			);
	}

	return (
		<section aria-labelledby="settle-up-title" className="border-t border-line pt-8">
			<p className="eyebrow text-warm-gray">Payment</p>
			<h2 id="settle-up-title" className="display-sm mt-2 text-charcoal">
				{title}
			</h2>
			<div className="mt-5">{body}</div>
			{due ? (
				<p className="mt-5 border-l-2 border-brass pl-4 text-sm text-charcoal">
					Please pay by <span className="tabular">{due}</span>. Unpaid bookings are released after that.
				</p>
			) : null}
		</section>
	);
}

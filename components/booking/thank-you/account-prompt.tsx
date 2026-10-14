import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';

/** Signed in → links to the account; guest → a sign-up nudge. Always offers another booking. */
export function AccountPrompt({ authenticated }: { authenticated: boolean }) {
	return (
		<section aria-label="Next steps" className="border-t border-line pt-8">
			{authenticated ? (
				<div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
					<Link href="/account/appointments" className={buttonClasses({ variant: 'primary', size: 'md', className: 'flex-1' })}>
						Your appointments
					</Link>
					<Link href="/account/orders" className={buttonClasses({ variant: 'outline', size: 'md', className: 'flex-1' })}>
						Your orders
					</Link>
				</div>
			) : (
				<div className="border border-line bg-paper p-6">
					<p className="eyebrow text-warm-gray">Keep your card</p>
					<p className="mt-2 font-display text-[1.35rem] leading-snug text-charcoal">
						Create an account to <em className="italic-display">reschedule</em> and see past visits.
					</p>
					<Link href="/auth/sign-up" className={buttonClasses({ variant: 'outline', size: 'sm', className: 'mt-5' })}>
						Create an account
					</Link>
				</div>
			)}
			<Link href="/services" className="eyebrow link-underline mt-6 inline-block text-[0.62rem] text-warm-gray hover:text-charcoal">
				Book another service <span aria-hidden>→</span>
			</Link>
		</section>
	);
}

import Link from 'next/link';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { buttonClasses } from '@/components/ui/button';

/**
 * Shown when the order can't be read — e.g. checkout with an existing
 * customer's email doesn't sign the visitor in, so the booking is only visible
 * after signing in with that email.
 */
export function GuestFallback({ orderId }: { orderId: string | null }) {
	const callbackUrl = encodeURIComponent(orderId ? `/account/orders/${orderId}` : '/account/orders');
	return (
		<div className="mx-auto mt-14 flex max-w-xl flex-col items-center border border-line bg-cream px-6 py-12 text-center sm:px-12">
			<div className="relative h-28 w-20">
				<ArchOutline className="absolute inset-0 h-full w-full" />
				<span className="absolute inset-x-0 top-[55%] font-display text-2xl italic text-brass" aria-hidden>
					H.
				</span>
			</div>
			<h2 className="display-sm mt-7 text-charcoal">
				Booking <em>received</em>
			</h2>
			<p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-warm-gray">
				A confirmation has been sent to your email. Sign in with the email you booked with to see your booking details.
			</p>
			<Link href={`/auth/sign-in?callbackUrl=${callbackUrl}`} className={buttonClasses({ variant: 'primary', size: 'md', className: 'mt-7' })}>
				Sign in
			</Link>
			<Link href="/services" className="eyebrow link-underline mt-5 text-[0.62rem] text-warm-gray hover:text-charcoal">
				Book another service
			</Link>
		</div>
	);
}

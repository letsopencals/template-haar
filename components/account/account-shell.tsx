'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Reveal } from '@/components/motion/reveal';
import { SPRING_SOFT } from '@/components/motion/easing';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { useNow } from '@/hooks/use-now';

const TABS = [
	{ href: '/account', label: 'Diary', numeral: 'I', match: (p: string) => p === '/account' || p.startsWith('/account/appointments') },
	{ href: '/account/orders', label: 'Orders', numeral: 'II', match: (p: string) => p.startsWith('/account/orders') },
	{ href: '/account/settings', label: 'Settings', numeral: 'III', match: (p: string) => p.startsWith('/account/settings') },
] as const;

const NO_MOTION = { duration: 0 } as const;

function salutation(now: Date | null): string {
	if (!now) return 'Welcome back';
	const h = now.getHours();
	if (h < 12) return 'Good morning';
	if (h < 18) return 'Good afternoon';
	return 'Good evening';
}

/**
 * Masthead for every /account page: "Your salon diary", a greeting with the
 * customer's first name, the Diary · Orders · Settings tabs (with a sliding
 * underline; this layout persists across tab navigations) and sign out.
 */
export function AccountShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { data: session } = useSession();
	const reduce = useReducedMotion();
	// Time-of-day greeting only after hydration (server has no client clock).
	const now = useNow(15 * 60_000);
	const firstName = session?.customer?.firstName;
	const email = session?.customer?.email;

	return (
		<section className="grain min-h-[100svh] bg-paper pt-28 pb-24 md:pt-36 md:pb-32">
			<div className="container-x relative z-[2]">
				<header className="border-b border-line pb-0">
					<Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
						<div className="min-w-0">
							<p className="eyebrow text-brass">Nº 00 — Members</p>
							<h1 className="display-md mt-5 text-charcoal [&_em]:text-accent">
								Your salon <em>diary</em>
							</h1>
							<p className="mt-4 text-base text-warm-gray">
								{salutation(now)}
								{firstName ? (
									<>
										, <span className="font-display text-lg italic text-charcoal">{firstName}</span>
									</>
								) : null}
								.
							</p>
						</div>
						<div className="flex items-center gap-6 pb-1">
							{email ? <span className="hidden max-w-[16rem] truncate text-xs text-warm-gray md:inline">{email}</span> : null}
							<button
								type="button"
								onClick={() => signOut({ callbackUrl: '/' })}
								className="eyebrow link-underline text-charcoal transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
							>
								Sign out
							</button>
						</div>
					</Reveal>

					<nav aria-label="Account" className="mt-10 -mb-px overflow-x-auto">
						<ul className="flex min-w-max gap-8 sm:gap-12">
							{TABS.map((tab) => {
								const active = tab.match(pathname);
								return (
									<li key={tab.href}>
										<Link
											href={tab.href}
											aria-current={active ? 'page' : undefined}
											className={clsx(
												'group relative flex items-baseline gap-2.5 pb-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
												active ? 'text-charcoal' : 'text-warm-gray hover:text-charcoal',
											)}
										>
											<span className="tabular text-[0.65rem] text-brass">{tab.numeral}</span>
											<span className="eyebrow">{tab.label}</span>
											{active ? (
												<motion.span
													layoutId="account-tab-underline"
													transition={reduce ? NO_MOTION : SPRING_SOFT}
													className="absolute inset-x-0 bottom-0 h-[2px] bg-accent"
												/>
											) : null}
										</Link>
									</li>
								);
							})}
						</ul>
					</nav>
				</header>

				<div className="pt-12 md:pt-16">{children}</div>
			</div>
		</section>
	);
}

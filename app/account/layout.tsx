'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';

const sidebarLinks = [
	{ href: '/account', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
	{ href: '/account/appointments', label: 'Appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
	{ href: '/account/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
	{ href: '/account/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const { data: session } = useSession();

	const customerName = [session?.customer?.firstName, session?.customer?.lastName].filter(Boolean).join(' ');

	return (
		<section className="bg-white pt-28 pb-20 lg:pt-36 lg:pb-32">
			<div className="mx-auto max-w-[1200px] px-6 lg:px-10">
				<div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
					{/* Sidebar */}
					<motion.aside
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4 }}
						className="lg:col-span-3"
					>
						<div className="border border-charcoal/10 p-5">
							<div className="mb-5 border-b border-charcoal/10 pb-5">
								<p className="text-sm font-semibold text-charcoal">{customerName || 'My Account'}</p>
								{session?.customer?.email && (
									<p className="mt-0.5 text-xs text-warm-gray">{session.customer.email}</p>
								)}
							</div>
							<nav className="space-y-1">
								{sidebarLinks.map((link) => {
									const isActive = pathname === link.href;
									return (
										<Link
											key={link.href}
											href={link.href}
											className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
												isActive
													? 'bg-cream font-medium text-charcoal'
													: 'text-warm-gray hover:bg-cream/50 hover:text-charcoal'
											}`}
										>
											<svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
												<path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
											</svg>
											{link.label}
										</Link>
									);
								})}
							</nav>
							<div className="mt-5 border-t border-charcoal/10 pt-5">
								<button
									onClick={() => signOut({ callbackUrl: '/' })}
									className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-warm-gray transition-colors hover:text-red-600"
								>
									<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
									</svg>
									Sign Out
								</button>
							</div>
						</div>
					</motion.aside>

					{/* Main content */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="lg:col-span-9"
					>
						{children}
					</motion.div>
				</div>
			</div>
		</section>
	);
}

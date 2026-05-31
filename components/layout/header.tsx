'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/contexts/cart-context';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { siteConfig } from '@/lib/site-config';

const navLinks = [
	{ href: '/', label: 'Home' },
	{ href: '/services', label: 'Services' },
	{ href: '/about', label: 'About' },
	{ href: '/contact', label: 'Contact' },
];

export function Header() {
	const { data: session, status } = useSession();
	const { cart } = useCart();
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isCartOpen, setIsCartOpen] = useState(false);

	const cartItemCount = cart?.items?.length ?? 0;

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 50);
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => { document.body.style.overflow = ''; };
	}, [isMobileMenuOpen]);

	return (
		<>
			<header
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
					isScrolled
						? 'bg-white/95 backdrop-blur-md shadow-sm'
						: 'bg-transparent'
				}`}
			>
				<div className="mx-auto max-w-[1400px] px-6 lg:px-10">
					<div className="flex h-20 items-center justify-between">
						{/* Logo */}
						<Link href="/" className="relative z-10">
							<span className="font-display text-2xl font-bold tracking-tight text-charcoal">
								{siteConfig.logo.text}<span className="text-accent">{siteConfig.logo.accent}</span>
							</span>
						</Link>

						{/* Desktop Nav */}
						<nav className="hidden items-center gap-10 md:flex">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="link-underline text-sm font-medium uppercase tracking-widest text-charcoal/80 transition-colors hover:text-charcoal"
								>
									{link.label}
								</Link>
							))}
						</nav>

						{/* Auth + Book Now + Mobile Toggle */}
						<div className="flex items-center gap-4">
							{status === 'authenticated' ? (
								<div className="hidden items-center gap-4 md:flex">
									<Link
										href="/account"
										className="text-sm font-medium text-charcoal/80 transition-colors hover:text-charcoal"
									>
										{session.customer?.firstName || 'Account'}
									</Link>
									<CartButton count={cartItemCount} onClick={() => setIsCartOpen(true)} />
									<Link
										href="/services"
										className="rounded-none bg-charcoal px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent"
									>
										Book Now
									</Link>
								</div>
							) : (
								<div className="hidden items-center gap-4 md:flex">
									<Link
										href="/auth/sign-in"
										className="text-sm font-medium text-charcoal/80 transition-colors hover:text-charcoal"
									>
										Sign In
									</Link>
									<CartButton count={cartItemCount} onClick={() => setIsCartOpen(true)} />
									<Link
										href="/services"
										className="rounded-none bg-charcoal px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent"
									>
										Book Now
									</Link>
								</div>
							)}

							{/* Mobile cart */}
							<div className="md:hidden">
								<CartButton count={cartItemCount} onClick={() => setIsCartOpen(true)} />
							</div>

							{/* Mobile hamburger */}
							<button
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
								className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
								aria-label="Toggle menu"
							>
								<motion.span
									animate={isMobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
									className="block h-[2px] w-6 bg-charcoal"
								/>
								<motion.span
									animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
									className="block h-[2px] w-6 bg-charcoal"
								/>
								<motion.span
									animate={isMobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
									className="block h-[2px] w-6 bg-charcoal"
								/>
							</button>
						</div>
					</div>
				</div>
			</header>

			{/* Cart Drawer */}
			<CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />

			{/* Mobile Menu Overlay */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.3 }}
						className="fixed inset-0 z-40 bg-white"
					>
						<div className="flex h-full flex-col items-center justify-center gap-8">
							{navLinks.map((link, i) => (
								<motion.div
									key={link.href}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.1 + 0.2 }}
								>
									<Link
										href={link.href}
										onClick={() => setIsMobileMenuOpen(false)}
										className="heading-display text-4xl text-charcoal transition-colors hover:text-accent"
									>
										{link.label}
									</Link>
								</motion.div>
							))}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6 }}
								className="flex flex-col items-center gap-3"
							>
								<Link
									href="/services"
									onClick={() => setIsMobileMenuOpen(false)}
									className="mt-4 inline-block bg-charcoal px-10 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-all hover:bg-accent"
								>
									Book Now
								</Link>
								{status === 'authenticated' ? (
									<>
										<Link
											href="/account"
											onClick={() => setIsMobileMenuOpen(false)}
											className="text-sm font-medium text-charcoal/70 hover:text-accent"
										>
											My Account
										</Link>
										<button
											onClick={() => { signOut(); setIsMobileMenuOpen(false); }}
											className="text-sm font-medium text-warm-gray hover:text-accent"
										>
											Sign Out
										</button>
									</>
								) : (
									<Link
										href="/auth/sign-in"
										onClick={() => setIsMobileMenuOpen(false)}
										className="text-sm font-medium text-charcoal/70 hover:text-accent"
									>
										Sign In
									</Link>
								)}
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

function CartButton({ count, onClick }: { count: number; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			className="relative flex h-10 w-10 items-center justify-center text-charcoal/80 transition-colors hover:text-charcoal"
			aria-label={`Cart (${count} items)`}
		>
			<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
				<path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
			</svg>
			{count > 0 && (
				<span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center bg-accent text-[10px] font-bold text-white">
					{count}
				</span>
			)}
		</button>
	);
}

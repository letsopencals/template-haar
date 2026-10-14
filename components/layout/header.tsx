'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useMotionValueEvent, useScroll, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/contexts/cart-context';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { buttonClasses } from '@/components/ui/button';
import { DURATION, EASE_EXPO } from '@/components/motion/easing';
import { MenuOverlay } from '@/components/layout/menu-overlay';
import { CartPill } from '@/components/layout/cart-pill';
import { BAR_LINKS } from '@/components/layout/nav-links';
import { siteConfig } from '@/lib/site-config';

const BAR_SHOWN = { y: '0%' } as const;
const BAR_HIDDEN = { y: '-100%' } as const;
const BAR_TRANSITION: Transition = { duration: DURATION.base, ease: EASE_EXPO };

/**
 * Thin masthead that condenses into a compact glass bar once the page scrolls,
 * hides on scroll down and returns on scroll up. "Menu" opens the full-screen
 * contents overlay; "Your card (n)" opens the existing cart drawer.
 */
export function Header() {
	const { data: session, status } = useSession();
	const { cart } = useCart();
	const pathname = usePathname();
	const { scrollY } = useScroll();
	const [compact, setCompact] = useState(false);
	const [hidden, setHidden] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [cartOpen, setCartOpen] = useState(false);
	const toggleRef = useRef<HTMLButtonElement>(null);

	const cardCount = cart?.items?.length ?? 0;
	const authenticated = status === 'authenticated';
	const firstName = session?.customer?.firstName ?? null;

	useMotionValueEvent(scrollY, 'change', (y) => {
		const prev = scrollY.getPrevious() ?? 0;
		setCompact(y > 40);
		if (menuOpen || cartOpen) return;
		if (y > 240 && y > prev + 4) setHidden(true);
		else if (y < prev - 4 || y <= 240) setHidden(false);
	});

	const closeMenu = useCallback(() => setMenuOpen(false), []);
	const openCart = useCallback(() => {
		setMenuOpen(false);
		setCartOpen(true);
	}, []);
	const closeCart = useCallback(() => setCartOpen(false), []);
	const handleSignOut = useCallback(() => {
		setMenuOpen(false);
		void signOut();
	}, []);

	return (
		<>
			<motion.header
				className="fixed inset-x-0 top-0 z-50"
				initial={false}
				animate={hidden ? BAR_HIDDEN : BAR_SHOWN}
				transition={BAR_TRANSITION}
			>
				<div
					className={clsx(
						'border-b transition-[background-color,border-color,backdrop-filter] duration-500',
						compact ? 'glass border-line' : 'border-transparent bg-transparent',
					)}
				>
					<div
						className={clsx(
							'container-x grid grid-cols-[1fr_auto_1fr] items-center gap-4 transition-[height] duration-500',
							compact ? 'h-16' : 'h-20',
						)}
					>
						{/* Left: menu toggle + inline links */}
						<div className="flex items-center gap-8">
							<button
								ref={toggleRef}
								type="button"
								onClick={() => setMenuOpen(true)}
								aria-expanded={menuOpen}
								aria-haspopup="dialog"
								aria-label="Open menu"
								className="group flex h-11 items-center gap-3 text-charcoal outline-none focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-accent"
							>
								<span aria-hidden className="flex w-6 flex-col gap-[5px]">
									<span className="block h-px w-6 origin-left bg-current transition-transform duration-500 group-hover:scale-x-75" />
									<span className="block h-px w-4 origin-left bg-current transition-transform duration-500 group-hover:scale-x-150" />
								</span>
								<span className="eyebrow max-sm:sr-only">Menu</span>
							</button>
							<nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
								{BAR_LINKS.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										aria-current={pathname === link.href ? 'page' : undefined}
										className={clsx(
											'link-underline eyebrow transition-colors hover:text-charcoal',
											pathname === link.href ? 'text-charcoal' : 'text-charcoal/60',
										)}
									>
										{link.label}
									</Link>
								))}
							</nav>
						</div>

						{/* Centre: wordmark */}
						<Link
							href="/"
							aria-label={`${siteConfig.name} — home`}
							className={clsx(
								'font-display leading-none tracking-[-0.03em] text-charcoal transition-[font-size] duration-500',
								compact ? 'text-2xl' : 'text-[1.75rem] md:text-3xl',
							)}
						>
							{siteConfig.logo.text}
							<span className="text-accent">{siteConfig.logo.accent}</span>
						</Link>

						{/* Right: account, card, reserve */}
						<div className="flex items-center justify-end gap-4 md:gap-6">
							{authenticated ? (
								<Link href="/account" className="link-underline eyebrow hidden text-charcoal/70 hover:text-charcoal md:inline-block">
									{firstName || 'Account'}
								</Link>
							) : (
								<Link href="/auth/sign-in" className="link-underline eyebrow hidden text-charcoal/70 hover:text-charcoal md:inline-block">
									Sign in
								</Link>
							)}
							<CartPill count={cardCount} onClick={openCart} />
							<Link href="/services" className={buttonClasses({ size: 'sm', className: 'max-lg:hidden' })}>
								Reserve
							</Link>
						</div>
					</div>
				</div>
			</motion.header>

			<MenuOverlay
				open={menuOpen}
				onClose={closeMenu}
				authenticated={authenticated}
				firstName={firstName}
				onSignOut={handleSignOut}
				onOpenCard={openCart}
				cardCount={cardCount}
			/>

			<CartDrawer open={cartOpen} onClose={closeCart} />
		</>
	);
}

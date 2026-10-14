'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, type Transition } from 'framer-motion';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { useSmoothScroll } from '@/components/motion/smooth-scroll';
import { DURATION, EASE_EXPO, EASE_OUT } from '@/components/motion/easing';
import { ArchOutline } from '@/components/motifs/arch-outline';
import { SafeImage } from '@/components/ui/safe-image';
import { OpenTodayChip } from '@/components/home/open-today-chip';
import { NAV_LINKS } from '@/components/layout/nav-links';
import { siteConfig } from '@/lib/site-config';

const PANEL_INITIAL = { clipPath: 'inset(0% 0% 100% 0%)' } as const;
const PANEL_OPEN = { clipPath: 'inset(0% 0% 0% 0%)' } as const;
const PANEL_TRANSITION: Transition = { duration: DURATION.slow, ease: EASE_EXPO };
const PANEL_EXIT = { clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: DURATION.base, ease: EASE_EXPO } } as const;
const LINE_HIDDEN = { y: '110%' } as const;
const LINE_SHOWN = { y: '0%' } as const;
const lineTransition = (i: number): Transition => ({ duration: DURATION.base + 0.1, ease: EASE_OUT, delay: 0.25 + i * 0.07 });
const FADE_HIDDEN = { opacity: 0 } as const;
const FADE_SHOWN = { opacity: 1 } as const;
const FADE_TRANSITION: Transition = { duration: DURATION.base, delay: 0.55 };
const IMG_IN = { opacity: 1, scale: 1 } as const;
const IMG_OUT = { opacity: 0, scale: 1.08 } as const;
const IMG_TRANSITION: Transition = { duration: DURATION.base, ease: EASE_OUT };
const NO_MOTION: Transition = { duration: 0 };

const FOCUSABLE = 'a[href], button:not([disabled]), select, input, [tabindex]:not([tabindex="-1"])';

export interface MenuOverlayProps {
	open: boolean;
	onClose: () => void;
	authenticated: boolean;
	firstName?: string | null;
	onSignOut: () => void;
	onOpenCard: () => void;
	cardCount: number;
}

/**
 * Full-screen charcoal menu: big Bodoni links with staggered line reveals and
 * an arch preview of the hovered link. Traps focus, closes on Escape and route
 * change, and pauses Lenis while open (`data-lenis-prevent` keeps its own scroll).
 */
export function MenuOverlay(props: MenuOverlayProps) {
	return <AnimatePresence>{props.open ? <MenuPanel {...props} /> : null}</AnimatePresence>;
}

function MenuPanel({ onClose, authenticated, firstName, onSignOut, onOpenCard, cardCount }: MenuOverlayProps) {
	const pathname = usePathname();
	const lenis = useSmoothScroll();
	const reduce = useReducedMotion();
	const panel = useRef<HTMLDivElement>(null);
	const [hovered, setHovered] = useState(() => Math.max(0, NAV_LINKS.findIndex((l) => l.href === pathname)));
	const firstPath = useRef(pathname);

	// Close when the route changes underneath us.
	useEffect(() => {
		if (pathname !== firstPath.current) onClose();
	}, [pathname, onClose]);

	// Pause page scrolling.
	useEffect(() => {
		lenis?.stop();
		const prev = document.documentElement.style.overflow;
		document.documentElement.style.overflow = 'hidden';
		return () => {
			lenis?.start();
			document.documentElement.style.overflow = prev;
		};
	}, [lenis]);

	// Focus the first link, trap Tab, close on Escape, restore focus on unmount.
	useEffect(() => {
		const opener = document.activeElement as HTMLElement | null;
		const node = panel.current;
		node?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				onClose();
				return;
			}
			if (e.key !== 'Tab' || !node) return;
			const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
			if (items.length === 0) return;
			const first = items[0]!;
			const last = items[items.length - 1]!;
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('keydown', onKey);
			opener?.focus?.();
		};
	}, [onClose]);

	return (
		<motion.div
			ref={panel}
			role="dialog"
			aria-modal="true"
			aria-label="Site menu"
			data-lenis-prevent
			className="grain fixed inset-0 z-[60] overflow-y-auto bg-charcoal text-white"
			initial={reduce ? false : PANEL_INITIAL}
			animate={PANEL_OPEN}
			exit={reduce ? FADE_HIDDEN : PANEL_EXIT}
			transition={reduce ? NO_MOTION : PANEL_TRANSITION}
		>
			<div className="container-x relative z-[2] flex min-h-full flex-col">
				{/* Top bar */}
				<div className="flex h-20 items-center justify-between border-b border-white/10">
					<span className="eyebrow tabular text-white/50">Contents</span>
					<Link href="/" onClick={onClose} className="font-display text-2xl tracking-[-0.02em]">
						{siteConfig.logo.text}
						<span className="text-accent">{siteConfig.logo.accent}</span>
					</Link>
					<button
						type="button"
						onClick={onClose}
						className="group flex h-11 items-center gap-3 text-white/80 outline-none transition-colors hover:text-white focus-visible:outline-1 focus-visible:outline-accent"
						aria-label="Close menu"
					>
						<span className="eyebrow max-sm:sr-only">Close</span>
						<span aria-hidden className="relative block h-4 w-6">
							<span className="absolute left-0 top-1/2 h-px w-6 rotate-45 bg-current" />
							<span className="absolute left-0 top-1/2 h-px w-6 -rotate-45 bg-current" />
						</span>
					</button>
				</div>

				<div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-12">
					<nav aria-label="Primary" className="lg:col-span-7">
						<ol>
							{NAV_LINKS.map((link, i) => {
								const active = pathname === link.href;
								return (
									<li key={link.href} className="border-b border-white/10">
										<Link
											href={link.href}
											onClick={onClose}
											onPointerEnter={() => setHovered(i)}
											onFocus={() => setHovered(i)}
											data-autofocus={i === 0 ? '' : undefined}
											aria-current={active ? 'page' : undefined}
											className="group/link flex items-baseline gap-5 py-4 outline-none focus-visible:text-accent md:gap-8 md:py-5"
										>
											<span className="tabular w-8 text-xs text-brass-light">{String(i + 1).padStart(2, '0')}</span>
											<span className="block overflow-hidden pb-[0.08em]">
												<motion.span
													className={clsx(
														'block font-display text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.95] tracking-[-0.035em] transition-[color,transform] duration-500 group-hover/link:translate-x-3 group-hover/link:italic',
														active ? 'italic text-accent' : 'text-white',
													)}
													initial={reduce ? false : LINE_HIDDEN}
													animate={LINE_SHOWN}
													transition={lineTransition(i)}
												>
													{link.label}
												</motion.span>
											</span>
											<span className="ml-auto hidden text-[0.8rem] text-white/45 sm:block">{link.note}</span>
										</Link>
									</li>
								);
							})}
						</ol>
					</nav>

					{/* Arch preview */}
					<div className="hidden lg:col-span-4 lg:col-start-9 lg:block">
						<figure className="relative mx-auto w-full max-w-[22rem]">
							<ArchOutline className="absolute -right-4 -top-4 h-full w-full" strokeClassName="stroke-brass-light/50" />
							<div className="arch image-placeholder relative aspect-[3/4] w-full">
								{NAV_LINKS.map((link, i) => (
									<motion.div key={link.href} className="absolute inset-0" initial={false} animate={i === hovered ? IMG_IN : IMG_OUT} transition={IMG_TRANSITION}>
										<SafeImage src={link.image} alt="" fill sizes="352px" className="object-cover" />
									</motion.div>
								))}
							</div>
							<figcaption className="mt-3 flex justify-between border-t border-white/10 pt-2 text-[0.72rem] text-white/50">
								<span className="tabular text-brass-light">Pl. {String(hovered + 1).padStart(2, '0')}</span>
								<span className="italic-display text-white/80">{NAV_LINKS[hovered]?.note}</span>
							</figcaption>
						</figure>
					</div>
				</div>

				{/* Footer row */}
				<motion.div
					className="grid gap-6 border-t border-white/10 py-8 text-sm text-white/60 sm:grid-cols-3 sm:items-center"
					initial={reduce ? false : FADE_HIDDEN}
					animate={FADE_SHOWN}
					transition={FADE_TRANSITION}
				>
					<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
						{authenticated ? (
							<>
								<Link href="/account" onClick={onClose} className="link-underline text-white">
									{firstName ? `${firstName}'s diary` : 'Your salon diary'}
								</Link>
								<button type="button" onClick={onSignOut} className="link-underline text-white/60 hover:text-white">
									Sign out
								</button>
							</>
						) : (
							<Link href="/auth/sign-in" onClick={onClose} className="link-underline text-white">
								Sign in
							</Link>
						)}
						<button type="button" onClick={onOpenCard} className="link-underline text-white/60 hover:text-white">
							Your card (<span className="tabular">{cardCount}</span>)
						</button>
					</div>
					<div className="sm:text-center">
						<OpenTodayChip tone="dark" />
					</div>
					<div className="flex flex-col gap-1 sm:items-end">
						<a href={`tel:${siteConfig.contact.phone.replace(/[^+\d]/g, '')}`} className="tabular hover:text-white">
							{siteConfig.contact.phone}
						</a>
						<a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white">
							{siteConfig.contact.email}
						</a>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}

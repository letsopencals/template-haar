'use client';

import { useEffect, useState } from 'react';
import { motion, type Transition } from 'framer-motion';
import { useReducedMotion } from '@/components/motion/use-reduced-motion';
import { DURATION, EASE_EXPO, EASE_OUT } from './easing';

export const INTRO_STORAGE_KEY = 'haar:intro-seen';
const INTRO_ATTR = 'data-intro-seen';

/** Inline <head> script: marks <html> before paint when the intro already played this session. */
export function IntroScript() {
	const js = `try{if(sessionStorage.getItem('${INTRO_STORAGE_KEY}'))document.documentElement.setAttribute('${INTRO_ATTR}','')}catch(e){}`;
	return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

const WORD = 'HAAR'.split('');
const LETTER_HIDDEN = { y: '105%' } as const;
const LETTER_SHOWN = { y: '0%' } as const;
const letterTransition = (i: number): Transition => ({ duration: DURATION.base, ease: EASE_OUT, delay: 0.1 + i * 0.07 });
const WORD_OUT = { opacity: 0, y: -24, transition: { duration: 0.5, ease: EASE_OUT, delay: 0.75 } } as const;
const ARCH_CLOSED = { scale: 1 } as const;
const ARCH_OPEN = { scale: 14 } as const;
const ARCH_TRANSITION: Transition = { duration: DURATION.intro, ease: EASE_EXPO, delay: 0.95 };

/**
 * First-visit intro for the home page: the HAAR wordmark rises, then an arch
 * (the salon's mirror) opens out of the cream page until it swallows the
 * viewport, revealing the hero. Once per session; `<IntroScript />` in <head>
 * hides it before paint for returning visitors. Reduced motion: never shown.
 *
 * The cream "page" is the arch's own giant box-shadow, which follows its
 * border-radius — so scaling the arch opens a perfectly shaped window.
 */
export function IntroCurtain() {
	const reduce = useReducedMotion();
	const [phase, setPhase] = useState<'pending' | 'playing' | 'done'>('pending');

	useEffect(() => {
		let seen = false;
		try {
			seen = !!sessionStorage.getItem(INTRO_STORAGE_KEY);
			sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
		} catch {
			seen = false;
		}
		if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			setPhase('done');
			return;
		}
		const id = window.requestAnimationFrame(() => setPhase('playing'));
		return () => window.cancelAnimationFrame(id);
	}, []);

	if (phase === 'done' || reduce) return null;
	const playing = phase === 'playing';

	return (
		<div aria-hidden data-intro className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center overflow-hidden">
			<motion.div
				className="arch-sm relative h-[34vmin] w-[22vmin] shadow-[0_0_0_200vmax_var(--color-cream)] will-change-transform"
				initial={ARCH_CLOSED}
				animate={playing ? ARCH_OPEN : ARCH_CLOSED}
				transition={ARCH_TRANSITION}
				onAnimationComplete={() => playing && setPhase('done')}
			>
				<div className="absolute inset-0 rounded-[inherit] border border-brass/70" />
			</motion.div>
			<motion.div
				className="absolute flex overflow-hidden font-display text-[16vmin] leading-none tracking-[-0.04em] text-charcoal"
				animate={playing ? WORD_OUT : undefined}
			>
				{WORD.map((l, i) => (
					<span key={i} className="block overflow-hidden pb-[0.08em]">
						<motion.span className="block" initial={LETTER_HIDDEN} animate={playing ? LETTER_SHOWN : LETTER_HIDDEN} transition={letterTransition(i)}>
							{l}
						</motion.span>
					</span>
				))}
				<span className="block overflow-hidden pb-[0.08em]">
					<motion.span className="block text-accent" initial={LETTER_HIDDEN} animate={playing ? LETTER_SHOWN : LETTER_HIDDEN} transition={letterTransition(WORD.length)}>
						.
					</motion.span>
				</span>
			</motion.div>
		</div>
	);
}

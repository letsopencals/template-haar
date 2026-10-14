/**
 * Shared motion constants. Every motion component imports from here so the site
 * moves with one voice: slow, decelerating, editorial — never bouncy.
 */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DURATION = {
	fast: 0.35,
	base: 0.7,
	slow: 1.1,
	drive: 1.4,
	intro: 1.6,
} as const;

/** Default viewport config for whileInView reveals: play once, slightly before fully in view. */
export const VIEWPORT_ONCE = { once: true, margin: '0px 0px -12% 0px' } as const;

/** Spring used by the appointment card flip, sliding highlights and drawers. */
export const SPRING_SOFT = { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 } as const;

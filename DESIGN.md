# HAAR — "Editorial Atelier" design contract

HAAR reads like a fashion magazine printed on cream paper: Bodoni headlines that
mix roman and *italic*, numbered sections, plate captions, brass hairlines — and
one signature shape, **the arch**, taken from the salon's arched mirror in the
hero photo. Everything below is the shared contract; follow it on every page.

## 1. Palette (plain Tailwind names — `app/globals.css` `@theme`)

| Token | Value | Use |
|---|---|---|
| `paper` | `#faf7f3` | Page background |
| `cream` / `cream-dark` | `#f5f0eb` / `#e8e0d8` | Cards, alternating sections, placeholders |
| `charcoal` / `charcoal-light` | `#1a1a1a` / `#2a2a2a` | Ink; full-bleed "spreads" (dark sections) |
| `accent` (+`-light`/`-dark`) | `#e8530e` | Burnt orange. Sparingly: CTAs on hover, active chip dot, the italic word in a headline, drop caps |
| `warm-gray` (+`-light`) | `#8a8279` | Secondary text, captions |
| `brass` (+`-light`) | `#a8875a` | Hairlines, seals, arch frames, plate numbers. Never fills |
| `line` / `line-strong` | charcoal 12% / 24% | Rules and borders |

No new colours. No gradients other than scrims and the plaster placeholder.

## 2. Type

- **Display:** Bodoni Moda (`font-display`, variable opsz + italics). Scale:
  `.display-xl` (hero), `.display-lg` (section openers), `.display-md` (page
  titles), `.display-sm` (card titles). Weight 400. Put the emotional word in
  `<em>`: `The Art of <em>Hair</em>`.
- **Body / UI:** Inter Tight (`font-sans`, default).
- **Numbers:** Geist Mono via `.tabular` — prices, times, durations, countdowns,
  plate numbers ("Pl. 04"), section numbers ("01").
- **Labels:** `.eyebrow` (11px, 0.28em tracking, uppercase). Pattern:
  `<span class="eyebrow text-warm-gray">Nº 02 — The Menu</span>`.
- Long-read copy: `max-w-[62ch]`, `text-[17px] leading-[1.7]`; `.drop-cap` on the
  first paragraph of an editorial story.

## 3. Shape

- **Buttons and inputs are SQUARED** (`rounded-none`). Always.
- **Images live in arches**: `.arch` (true semicircle top) for portraits and hero
  plates, `.arch-sm` for small thumbnails/avatars in lists. Rectangular images
  are allowed for full-bleed spreads and the lookbook plates.
- Ornaments: `components/motifs/arch-outline.tsx` (hairline arch offset behind an
  image), `scissor-rule.tsx` (section divider), `seal.tsx` (brass circular seal
  — confirmation, "Held for you", footer).
- Cards: `bg-cream` or `bg-paper` + `border border-line`, no radius (or `rounded-sm`
  max). Elevation via `shadow-card` / `shadow-float` only for floating things
  (the live appointment card, drawers, modals).
- `.perforation` = ticket tear line inside appointment/confirmation cards.
- `.leader-line` = dotted leader between a service name and its price.
- `.grain` adds film grain to a section (needs no extra markup).

## 4. Motion (`components/motion/*` — never hand-roll framer variants for these)

| Primitive | Use |
|---|---|
| `Reveal` | Fade-rise any block in view |
| `RevealText` | Line-mask reveal for display headlines (`trigger="mount"` above the fold) |
| `RevealImage` / `RevealArch` | Image reveals; `RevealArch` = arch clip-path wipe (signature) |
| `ParallaxImage` | Subtle parallax inside a fixed frame |
| `CountUp`, `ui/animated-number` | Stats (in view) / live totals (on change) |
| `Marquee` | One per page max (home ticker) |
| `MagneticButton` | One hero/banner CTA per page max |
| `IntroCurtain` | Home hero only, once per session |
| `PageTransition` | Already wired in `app/template.tsx` |
| `useSmoothScroll()` | Lenis instance (`scrollTo`); add `data-lenis-prevent` to any scrollable drawer/modal/sheet |

Rules:
- Eases/durations from `components/motion/easing.ts` (`EASE_OUT`, `EASE_EXPO`,
  `DURATION.*`, `VIEWPORT_ONCE`). Hoist framer objects to module scope.
- Everything must honour `useReducedMotion()` (from `components/motion/use-reduced-motion`,
  hydration-safe): no parallax, no curtains, no pinned scroll, content visible.
- Animate `transform`/`opacity`/`clip-path` only. No layout-thrashing properties.
- Content must be in the SSR HTML (reveals start from opacity 0 via framer, not
  by rendering nothing). No CLS: reserve image space with aspect ratios.
- Hover-only affordances (cursor previews) are `pointer: fine` only; mobile gets
  an inline equivalent.

## 5. Voice

Magazine, warm, confident, short. "Reserve your chair", "Your card", "Held for
you", "Finishing touches", "The Chairs" (stylists), "The Menu" (services),
"Letters" (testimonials), "Your salon diary" (account). Number sections `01`,
`02`… Plate captions: `Pl. 04 · Balayage`.

## 6. Ownership

| Area | Folders |
|---|---|
| Home / About / Contact / chrome | `components/home/`, `components/layout/`, `app/page.tsx`, `app/about`, `app/contact` |
| Services / Booking composer | `components/services/`, `components/booking/` (except `thank-you/`), `app/services`, `app/booking`, `hooks/use-booking-flow.ts` |
| Cart / Checkout / Thank-you | `components/cart/`, `components/checkout/`, `components/booking/thank-you/`, `app/checkout`, `app/thank-you` |
| Account / Auth | `components/account/`, `components/auth/`, `app/account`, `app/auth`, `app/link` |
| Shared (change with care) | `components/ui/`, `components/motion/`, `components/motifs/`, `lib/`, `hooks/`, `app/globals.css` |

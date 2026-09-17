# Template conventions

This is a Next.js 15 (App Router) / React 19 storefront template built on
`@opencals/storefront-sdk`. These conventions keep the template fast and
maintainable. They apply to every template in `templates/` — this file is meant
to be copied across them (only the template name / branding differs).

## Data fetching

**RSC-first.** Read data on the server and pass it down. Do NOT fetch cacheable
data in a `useEffect` on the client.

- Server reads go through `lib/server-data.ts` — `React.cache()`-wrapped helpers
  (`getStoreSettings`, `getProducts`, `getProduct`) that call the SDK directly.
  `React.cache` dedupes calls within a request. Never import `lib/server-data.ts`
  from a `'use client'` file.
- `app/layout.tsx` is an async Server Component: it fetches store settings once
  and seeds `<Providers initialSettings={...}>`. `SettingsProvider` takes the
  value as a prop — it does not fetch.
- Read-only pages (e.g. `app/services/page.tsx`) are async Server Components that
  fetch with `lib/server-data.ts` and hand the result to a small `'use client'`
  child as `initialProducts` / `initialProduct`.

**Client reads use SWR, seeded with server data.** For data that genuinely needs
to live on the client (filtering, availability, add-ons, cart), use `useSWR`
against the template's own `/api/*` routes, with `fallbackData` set to the
server-rendered value so there's no loading flash on first paint.

- Shared fetcher: `lib/fetcher.ts`.
- Build the SWR key from its inputs and pass `null` when not ready (e.g. no date
  picked yet) so nothing fetches prematurely. Multiple SWR hooks run in parallel
  — never chain fetches through sequential `useEffect`s.
- `revalidateOnFocus: false` unless you specifically want refocus revalidation.

The `/api/*` routes stay: they are the client/SWR data source and call the SDK
server-side via the `@/lib/opencals` side-effect import.

## Components & files

**Pages compose; components implement.** A `page.tsx` should be: data fetching
(RSC) + layout/composition + wiring. Presentational blocks and interactive
widgets live in `components/`.

- Guideline: any `page.tsx` over ~150 lines, or one that defines a section /
  widget component, gets decomposed into `components/`.
- Group `components/` by route/domain: `components/booking/`, `components/account/`,
  `components/services/`, `components/home/`; shared primitives in `components/ui/`.
  Co-locate a route's private components under a matching subfolder
  (e.g. `components/account/appointment-detail/`).

**Never define a component inside another component** — it remounts on every
parent render. Define at module scope (or a separate file). Module-scope sibling
helpers below a page are fine.

**Use the shared UI primitives — don't hand-style buttons/inputs inline.**
- `components/ui/button.tsx` — `<Button variant size fullWidth>`. Variants:
  `primary` (solid charcoal → hovers to accent), `outline` (bordered `charcoal/10`
  → hovers to cream), `ghost` (text link → hovers to accent). Sizes `sm|md|lg`.
  All buttons are SQUARED (`rounded-none`) — this is the canonical shape for haar's
  minimalist salon aesthetic; don't reintroduce rounded/pill buttons. haar uses
  plain Tailwind color classes (`charcoal`, `accent`, `cream`, `warm-gray`), NOT
  CSS-var tokens like the other templates. Pass only layout classes (`mt-*`,
  `flex-1`, `gap-*`, `fullWidth` for `w-full`) via `className`; color/padding/
  rounding/font/tracking come from the variant/size.
- `components/ui/input.tsx` — `<Input>` / `<Textarea>` for the canonical squared
  box text field (`border border-charcoal/10 bg-white ... focus:border-charcoal`).
- Leave genuinely-different controls inline: selection/toggle chips with an
  active/selected state (staff/time/day/variant/location pickers, step indicator),
  destructive buttons (red `border-red-200 text-red-600` / `bg-red-600` — no
  destructive variant), `<select>`, checkboxes/radios, icon-only controls
  (hamburger/close/qty +/-), the compact promo-code apply/input group, the contact
  page's underline (`border-b-2`) fields, and navigation rendered as `next/link`
  `<Link>` (Button renders a `<button>` and has no anchor mode).

**Hooks are single-concern.** Split multi-purpose hooks so each has one
responsibility and independent dependencies (see `hooks/use-checkout-questions.ts`,
`hooks/use-payment-providers.ts`, `hooks/use-cart-expiry.ts`, split out of the
checkout context / cart context). A large hook may remain as a thin orchestrator
that composes the smaller ones (`hooks/use-booking-flow.ts`).

## Re-render hygiene

- **Memoize context provider values** with `useMemo` — an inline `value={{...}}`
  object makes every consumer re-render on each provider render. All contexts here
  (`settings`, `location`, `timezone`, `cart`, `checkout`) follow this.
- Hoist static objects (framer-motion `initial`/`animate`/`transition`, default
  non-primitive props) to module-level `const`s instead of recreating them inline.
- `React.memo` leaf components that take stable props and render often
  (e.g. `components/booking/step-indicator.tsx`).
- Prefer a ternary (`cond ? <x/> : null`) over `cond && <x/>` for conditional
  rendering, to avoid accidentally rendering `0`/`''`.

## Bundle

- Load heavy / below-the-fold components with `next/dynamic`. Stripe is loaded
  this way in `components/checkout/payment-step.tsx` (`StripePayment`, `ssr: false`)
  so it isn't in the initial bundle.
- Import directly from module paths; avoid barrel/index re-export files that pull
  in more than you use.

## Verifying changes

- `npm run build` must pass. In the route summary, read-only pages should be `○`
  (static) or `ƒ` (dynamic) Server Components — not shipped as pure client pages.
- Smoke test: services list paints with no spinner on first load; location filter
  updates via SWR; the booking flow (service → time → add-ons → confirm → add to
  cart) and the checkout flow (customer → questions → payment) both complete.

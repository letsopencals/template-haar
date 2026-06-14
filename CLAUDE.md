# Haar Salon Template — Development Guidelines

## Overview

This is a Next.js 15 (App Router) storefront template powered by the `@opencals/storefront-sdk`. It demonstrates a complete booking-enabled storefront with services catalog, real-time availability, cart, checkout, Stripe payments, and customer account management.

## Prerequisites

- Node.js 20+
- `@opencals/storefront-sdk` (npm: `^0.3.0`)
- An Opencals store with a **Storefront API key** (`sfk_...`)
- `AUTH_SECRET` for NextAuth session encryption

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```
OPENCALS_API_KEY=sfk_your_key_here      # Required
AUTH_SECRET=random_secret_here           # Required for auth
OPENCALS_API_URL=https://api.opencals.com  # Optional override
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_... # Optional for payments
```

## SDK Setup

### Initialization (`lib/opencals.ts`)

The SDK is initialized once via a side-effect import. Every API route file must import it:

```ts
import '@/lib/opencals';
```

This calls `setupOpencals({ baseUrl, apiKey, logging })` which configures the global client with:
- API key interceptor (adds `X-Api-Key` header)
- Error handler interceptor (throws `OpencalsApiError` on non-OK responses)
- Logging interceptor (dev only)

### Error Handling in API Routes

The SDK throws `OpencalsApiError` on any non-2xx response. All API routes use the shared handler:

```ts
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    const { data } = await SomeService.method({ body });
    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
```

`handleApiError` extracts status code, error message, and field-level validation errors from the SDK error, preserving the backend's HTTP semantics for the client.

### Authentication (`lib/auth.ts`, `lib/api-auth.ts`)

- NextAuth v5 with credentials providers (email/password, OAuth via SDK)
- SDK's `AuthService.signIn()` returns access + refresh tokens
- Tokens stored in NextAuth JWT, auto-refreshed via `AuthService.refresh()`
- API routes use `requireAuth()` to get `{ headers: { Authorization } }` or return 401

### Service Classes

The SDK uses class-based service architecture. Import the service class directly:

```ts
import { ProductService, CartService, StoreService } from '@opencals/storefront-sdk';
```

Key services: `ProductService`, `CartService`, `CheckoutService`, `AppointmentService`, `AuthService`, `SelfService`, `OrderService`, `PaymentService`, `LocationService`, `StaffMemberService`, `StoreService`, `AddonService`.

## Architecture Patterns

### API Routes (`app/api/`)

- Thin wrappers around SDK service calls
- Always import `'@/lib/opencals'` at the top
- Use `handleApiError(err)` in catch blocks — never return generic "Internal server error"
- Use `requireAuth()` for protected routes
- Pass `X-Cart-Id` header for cart-scoped operations

### Client-Side Data Fetching (`hooks/use-api-request.ts`)

A unified hook for all API requests:

```ts
// GET (auto-fetches)
const { data, error, loading } = useApiRequest<Product[]>('/api/products');

// Mutation (manual trigger)
const { execute, loading, error, fieldErrors } = useApiRequest<Cart>('/api/book', {
  method: 'POST',
  autoFetch: false,
});
await execute({ slot, numberOfAttendees });
```

### Form Submissions (`hooks/use-form-submit.ts`)

Wraps `useApiRequest` and maps backend field errors to react-hook-form:

```ts
const { submit, isSubmitting, error } = useFormSubmit(form, {
  url: '/api/auth/sign-up',
});
await submit({ email, password });
// Field errors automatically set on the form
```

### Contexts

| Context | Purpose |
|---------|---------|
| `SettingsProvider` | Store public settings (currency, time/date format, contact info) |
| `CartProvider` | Cart state, cartId persistence (localStorage) |
| `LocationProvider` | Multi-location selection |
| `TimezoneProvider` | Client timezone detection |
| `SessionProvider` | NextAuth session |

### Currency Handling

- **Catalog pages** (services, booking): use `currency` from `useSettings()` context
- **Cart/checkout pages**: use `cart.paymentCurrencyCode` from the cart object
- **Order pages**: use `order.paymentCurrencyCode` from the order object
- Never hardcode `'USD'` — always pass the currency explicitly to `formatPrice()`

## Booking Flow

The booking page (`app/booking/[slug]/page.tsx`) uses `useBookingFlow` which orchestrates:

1. `useProductData` — fetches product by slug, manages variants
2. `useAvailability` — date/slot selection, fetches time slots
3. `useBookingAddOns` — add-ons for the selected variant
4. Step machine: date → time → add-ons → confirm

## Code Quality Rules

- No `as` type assertions unless interfacing with third-party libraries (NextAuth, Stripe)
- SDK types are the source of truth — never redeclare them locally
- All `formatPrice()` calls must pass an explicit currency parameter
- No `catch { return generic 500 }` — always use `handleApiError`
- Business logic lives in hooks, not components
- Shared utilities go in `lib/` (pure functions) or `hooks/` (stateful)

## Running

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint    # eslint
npx tsc --noEmit  # type check
```

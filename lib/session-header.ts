/**
 * The middleware refreshes the customer's access token (and persists it in the session cookie),
 * then hands the fresh token to the API route in the same request through this header. API routes
 * read it instead of calling `auth()` again: that would see the old cookie and try to refresh a
 * second time, and the backend rotates refresh tokens (each works once).
 */
export const ACCESS_TOKEN_HEADER = 'x-oc-access-token';

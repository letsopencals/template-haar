// Form ids shared by the section forms and the mobile pay bar (`<button form=…>`).
// Kept in their own module so the pay bar doesn't import Stripe.
export const DETAILS_FORM_ID = 'checkout-details';
export const QUESTIONS_FORM_ID = 'checkout-questions';
export const PAYMENT_METHOD_FORM_ID = 'checkout-payment-method';
export const STRIPE_FORM_ID = 'checkout-stripe';

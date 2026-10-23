import { setupOpencals } from '@opencals/storefront-sdk';
import { nextBuyerIp } from '@opencals/storefront-sdk/next';

setupOpencals({
	baseUrl: process.env.OPENCALS_API_URL ?? 'https://api.opencals.com',
	// A private storefront key (spk_): this site calls the API from its server. nextBuyerIp forwards each visitor's
	// IP on mutations (sign-in, cart, checkout), so the API rate-limits per visitor instead of per server.
	apiKey: process.env.OPENCALS_API_KEY,
	buyerIp: nextBuyerIp,
	logging: process.env.NODE_ENV === 'development',
});

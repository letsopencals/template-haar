import { setupOpencals } from '@opencals/storefront-sdk';

setupOpencals({
	baseUrl: process.env.OPENCALS_API_URL ?? 'https://api.opencals.com',
	apiKey: process.env.OPENCALS_API_KEY,
	logging: process.env.NODE_ENV === 'development',
});

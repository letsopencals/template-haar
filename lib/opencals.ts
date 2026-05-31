import { setupOpencals } from '@opencals/storefront-sdk';

export const client = setupOpencals({
	logging: process.env.NODE_ENV === 'development',
});

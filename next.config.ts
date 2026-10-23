import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		// Serve images as-is. Vercel's Image Optimization has a monthly quota (Hobby: 5,000
		// transformations), and once it's used up every new image returns 402 and renders blank.
		// The files in public/ are already web-sized; remove this line to re-enable optimization.
		unoptimized: true,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '*.opencals.com',
			},
		],
	},
};

export default nextConfig;

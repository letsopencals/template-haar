'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/contexts/cart-context';
import { TimezoneProvider } from '@/contexts/timezone-context';
import { LocationProvider } from '@/contexts/location-context';
import { SettingsProvider } from '@/contexts/settings-context';

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<SettingsProvider>
				<TimezoneProvider>
					<LocationProvider>
						<CartProvider>{children}</CartProvider>
					</LocationProvider>
				</TimezoneProvider>
			</SettingsProvider>
		</SessionProvider>
	);
}

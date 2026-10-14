import type { Metadata } from 'next';
import { OrdersList } from '@/components/account/orders/orders-list';

export const metadata: Metadata = { title: 'Orders' };

export default function OrdersPage() {
	return <OrdersList />;
}

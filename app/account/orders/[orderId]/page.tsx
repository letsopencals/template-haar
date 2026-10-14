import { OrderReceipt } from '@/components/account/orders/order-receipt';

type Params = Promise<{ orderId: string }>;

export default async function OrderDetailPage({ params }: { params: Params }) {
	const { orderId } = await params;
	return <OrderReceipt orderId={orderId} />;
}

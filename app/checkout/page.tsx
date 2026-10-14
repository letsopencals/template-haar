import { CheckoutProvider } from '@/contexts/checkout-context';
import { CheckoutView } from '@/components/checkout/checkout-view';

export default function CheckoutPage() {
	return (
		<CheckoutProvider>
			<CheckoutView />
		</CheckoutProvider>
	);
}

import { redirect } from 'next/navigation';

// The diary (/account) lists every appointment now.
export default function AppointmentsPage() {
	redirect('/account');
}

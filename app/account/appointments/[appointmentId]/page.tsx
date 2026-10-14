import { AppointmentDetailView } from '@/components/account/appointment-detail/appointment-detail-view';

type Params = Promise<{ appointmentId: string }>;

export default async function AppointmentDetailPage({ params }: { params: Params }) {
	const { appointmentId } = await params;
	return <AppointmentDetailView appointmentId={appointmentId} />;
}

import { AppointmentList } from '@/components/AppointmentList';
import { useSession } from '@/core/session';

export default function AppointmentsTab() {
  const role = useSession((state) => state.role);
  return <AppointmentList customerMode={role === 'customer'} />;
}

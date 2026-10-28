import { Redirect } from 'expo-router';

import { Overview } from '@/components/Overview';
import { useSession } from '@/core/session';

export default function OverviewTab() {
  const role = useSession((state) => state.role);
  // Specialists start on today's appointments; they have no overview tab.
  if (role === 'specialist') return <Redirect href="/appointments" />;
  return <Overview role={role === 'customer' ? 'customer' : 'manager'} />;
}

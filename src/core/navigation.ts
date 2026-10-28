import type { IconName } from '@/components/Icon';

import type { BeautyRole } from './models';

export type TabRoute =
  | 'index'
  | 'appointments'
  | 'packages'
  | 'profile'
  | 'customers'
  | 'sessions'
  | 'notifications'
  | 'finance'
  | 'management';

export const ALL_TAB_ROUTES: TabRoute[] = [
  'index',
  'appointments',
  'packages',
  'profile',
  'customers',
  'sessions',
  'notifications',
  'finance',
  'management',
];

/** Bottom navigation per verified role, in display order. */
export const tabsByRole: Record<BeautyRole, { name: TabRoute; title: string; icon: IconName }[]> = {
  customer: [
    { name: 'index', title: 'Ana sayfa', icon: 'home' },
    { name: 'appointments', title: 'Randevu', icon: 'calendar-month' },
    { name: 'packages', title: 'Paketler', icon: 'card-membership' },
    { name: 'profile', title: 'Profil', icon: 'person' },
  ],
  specialist: [
    { name: 'appointments', title: 'Bugün', icon: 'today' },
    { name: 'customers', title: 'Müşteriler', icon: 'people' },
    { name: 'sessions', title: 'Seans', icon: 'spa' },
    { name: 'notifications', title: 'Bildirim', icon: 'notifications' },
  ],
  manager: [
    { name: 'index', title: 'Özet', icon: 'space-dashboard' },
    { name: 'appointments', title: 'Operasyon', icon: 'calendar-month' },
    { name: 'finance', title: 'Finans', icon: 'payments' },
    { name: 'management', title: 'Yönetim', icon: 'apps' },
  ],
};

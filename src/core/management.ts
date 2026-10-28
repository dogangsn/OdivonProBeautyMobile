import type { IconName } from '@/components/Icon';

export const managementResources: { resource: string; title: string; icon: IconName }[] = [
  { resource: 'staff', title: 'Personel', icon: 'badge' },
  { resource: 'products', title: 'Stok', icon: 'inventory-2' },
  { resource: 'campaigns', title: 'Kampanya', icon: 'campaign' },
  { resource: 'commissions', title: 'Komisyon', icon: 'percent' },
  { resource: 'devices', title: 'Cihazlar', icon: 'developer-board' },
  { resource: 'reports', title: 'Raporlar', icon: 'insights' },
];

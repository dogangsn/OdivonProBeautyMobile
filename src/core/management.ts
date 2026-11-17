import type { IconName } from '@/components/Icon';
import type { Tone } from '@/theme';

/** Every resource here exists in MainApi `BEAUTY_RESOURCES` (GET /beauty/:resource). */
export const managementResources: { resource: string; title: string; detail: string; icon: IconName; tone: Tone }[] = [
  { resource: 'customers', title: 'Müşteriler', detail: 'Kart ve iletişim', icon: 'groups', tone: 'indigo' },
  { resource: 'staff', title: 'Personel', detail: 'Uzman ve ekip', icon: 'badge', tone: 'purple' },
  { resource: 'services', title: 'Hizmetler', detail: 'Katalog ve fiyat', icon: 'spa', tone: 'emerald' },
  { resource: 'products', title: 'Stok', detail: 'Ürün ve kritik eşik', icon: 'inventory-2', tone: 'amber' },
  { resource: 'campaigns', title: 'Kampanya', detail: 'Aktif kampanyalar', icon: 'campaign', tone: 'rose' },
  { resource: 'commissions', title: 'Komisyon', detail: 'Uzman hak edişleri', icon: 'percent', tone: 'sky' },
  { resource: 'devices', title: 'Cihazlar', detail: 'Lazer ve ekipman', icon: 'developer-board', tone: 'slate' },
  { resource: 'expenses', title: 'Giderler', detail: 'Şube giderleri', icon: 'receipt-long', tone: 'rose' },
];

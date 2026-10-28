import { tabsByRole } from '@/core/navigation';

describe('role navigation', () => {
  it('gives every role four tabs', () => {
    expect(tabsByRole.customer.map((tab) => tab.title)).toEqual(['Ana sayfa', 'Randevu', 'Paketler', 'Profil']);
    expect(tabsByRole.specialist.map((tab) => tab.title)).toEqual(['Bugün', 'Müşteriler', 'Seans', 'Bildirim']);
    expect(tabsByRole.manager.map((tab) => tab.title)).toEqual(['Özet', 'Operasyon', 'Finans', 'Yönetim']);
  });

  it('never shows finance or management to customers', () => {
    const names = tabsByRole.customer.map((tab) => tab.name);
    expect(names).not.toContain('finance');
    expect(names).not.toContain('management');
  });
});

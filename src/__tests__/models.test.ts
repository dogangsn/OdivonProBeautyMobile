import { ApiRecord, appointmentFromRecord, parseDashboard, parseSessionProfile, productRoleLabel, shellRoleFor } from '@/core/models';

describe('role mapping', () => {
  it('maps product roles to the mobile shell', () => {
    expect(shellRoleFor('customer')).toBe('customer');
    expect(shellRoleFor('specialist')).toBe('specialist');
    expect(shellRoleFor('receptionist')).toBe('specialist');
    expect(shellRoleFor('cashier')).toBe('specialist');
    expect(shellRoleFor('owner')).toBe('manager');
    expect(shellRoleFor('auditor')).toBe('manager');
  });

  it('labels product roles in Turkish', () => {
    expect(productRoleLabel('owner', 'manager')).toBe('İşletme sahibi');
    expect(productRoleLabel('unknown', 'specialist')).toBe('Uzman');
    expect(productRoleLabel(undefined, undefined)).toBe('');
  });
});

describe('parsers', () => {
  it('parses the /me profile defensively', () => {
    const profile = parseSessionProfile({ uid: 'u1', role: 'manager', assigned: true, branchId: 42 });
    expect(profile).toMatchObject({ uid: 'u1', productRole: 'manager', assigned: true, tenantName: 'OdivonPro Beauty' });
    expect(profile.branchId).toBeUndefined();
  });

  it('builds appointment summaries with fallbacks', () => {
    const item = appointmentFromRecord(
      new ApiRecord({ id: 'a1', customerId: 'c1', title: 'Lazer', startAt: '2026-10-28T10:00:00Z', status: 'confirmed' }),
    );
    expect(item.customerName).toBe('c1');
    expect(item.serviceName).toBe('Lazer');
    expect(item.startAt?.toISOString()).toBe('2026-10-28T10:00:00.000Z');
    expect(appointmentFromRecord(new ApiRecord({ id: 'a2', startAt: 'bad' })).startAt).toBeUndefined();
  });

  it('parses dashboard numbers', () => {
    expect(parseDashboard({ appointments: 3.7, revenue: 1250.5, customers: 'x' })).toEqual({
      appointments: 3,
      customers: 0,
      revenue: 1250.5,
      criticalStock: 0,
      sessions: 0,
      packages: 0,
    });
  });
});

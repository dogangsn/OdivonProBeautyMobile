import { createBeautyApi } from '@/core/api';

const BASE = 'https://api.test/api/v1/beauty';

function setup(responses: { status?: number; body: unknown }[]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchMock = jest.fn(async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const next = responses.shift() ?? { body: { data: null } };
    return {
      status: next.status ?? 200,
      text: async () => (typeof next.body === 'string' ? next.body : JSON.stringify(next.body)),
    } as Response;
  });
  const api = createBeautyApi({
    baseUrl: `${BASE}/`,
    getToken: async () => 'token-1',
    fetch: fetchMock as unknown as typeof fetch,
    idempotencyKey: () => 'key-1',
  });
  return { api, calls };
}

describe('MainApi client', () => {
  it('sends the bearer token and unwraps the data envelope', async () => {
    const { api, calls } = setup([{ body: { success: true, data: { uid: 'u1', role: 'customer', assigned: true } } }]);
    const profile = await api.session();
    expect(profile.productRole).toBe('customer');
    expect(calls[0].url).toBe(`${BASE}/me`);
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe('Bearer token-1');
  });

  it('uppercases the centre code when connecting a customer', async () => {
    const { api, calls } = setup([{ body: { data: {} } }]);
    await api.connectCustomer('  by-abc123 ');
    expect(calls[0].url).toBe(`${BASE}/mobile/connect`);
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ centerCode: 'BY-ABC123' });
  });

  it('lists records with a limit and range query', async () => {
    const { api, calls } = setup([{ body: { data: [{ id: 'a1', status: 'confirmed' }, 'junk'] } }]);
    const items = await api.appointments({ from: new Date('2026-10-01T00:00:00Z') });
    expect(items).toHaveLength(1);
    expect(calls[0].url).toBe(`${BASE}/appointments?limit=100&from=2026-10-01T00%3A00%3A00.000Z`);
  });

  it('adds an idempotency key to appointment commands', async () => {
    const { api, calls } = setup([{ body: { data: {} } }]);
    await api.createAppointment({ branchId: 'b1' });
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ branchId: 'b1', idempotencyKey: 'key-1' });
  });

  it('surfaces the server message on errors', async () => {
    const { api } = setup([{ status: 403, body: { message: 'Yetkiniz yok.' } }]);
    await expect(api.dashboard()).rejects.toThrow('Yetkiniz yok.');
  });

  it('falls back to a status message for non-JSON errors', async () => {
    const { api } = setup([{ status: 502, body: '<html>' }]);
    await expect(api.list('customers')).rejects.toThrow('MainApi isteği tamamlanamadı (502).');
  });
});

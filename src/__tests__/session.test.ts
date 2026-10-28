import type { BeautyApi } from '@/core/api';
import type { AuthGateway, AuthUser } from '@/core/auth';
import { createSessionStore } from '@/core/session';

jest.mock('@/core/client', () => ({ getBeautyApi: jest.fn() }));

const user: AuthUser = {
  uid: 'u1',
  displayName: null,
  email: 'uzman@example.com',
  phoneNumber: null,
  getIdToken: jest.fn(async () => 'token'),
};

function fakeApi(profile: Partial<Awaited<ReturnType<BeautyApi['session']>>>): BeautyApi {
  return {
    session: jest.fn(async () => ({
      uid: 'u1',
      tenantId: 't1',
      tenantName: 'Merkez',
      productRole: '',
      assigned: false,
      displayName: '',
      ...profile,
    })),
    connectCustomer: jest.fn(async () => undefined),
  } as unknown as BeautyApi;
}

const fakeGateway = { signOut: jest.fn(async () => undefined) } as unknown as AuthGateway;

describe('session store', () => {
  it('resolves the shell role from the server profile', async () => {
    const api = fakeApi({ productRole: 'receptionist', assigned: true });
    const store = createSessionStore({ api: () => api, gateway: () => fakeGateway });
    await store.getState().acceptUser(user);
    expect(store.getState()).toMatchObject({
      status: 'signedIn',
      role: 'specialist',
      productRole: 'receptionist',
      displayName: 'uzman@example.com',
    });
    expect(api.connectCustomer).not.toHaveBeenCalled();
  });

  it('links the pending centre code before reading the profile', async () => {
    const api = fakeApi({ productRole: 'customer', assigned: true });
    const store = createSessionStore({ api: () => api, gateway: () => fakeGateway });
    store.getState().setPendingCenterCode('BY-123456');
    await store.getState().acceptUser(user);
    expect(api.connectCustomer).toHaveBeenCalledWith('BY-123456');
    expect(store.getState()).toMatchObject({ role: 'customer', pendingCenterCode: undefined });
  });

  it('rejects accounts that are not assigned to a centre and signs out of Firebase', async () => {
    const store = createSessionStore({ api: () => fakeApi({}), gateway: () => fakeGateway });
    await expect(store.getState().acceptUser(user)).rejects.toThrow('mobil erişim');
    expect(store.getState().status).toBe('signedOut');
    expect(store.getState().error).toContain('güzellik merkezi profiline bağlanmamış');
    expect(fakeGateway.signOut).toHaveBeenCalled();
  });

  it('starts signed out when Firebase is not configured', () => {
    const store = createSessionStore({ api: () => fakeApi({}), gateway: () => null });
    expect(store.getState().status).toBe('signedOut');
  });
});

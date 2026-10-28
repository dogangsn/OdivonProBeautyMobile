import { create } from 'zustand';

import { errorMessage, type BeautyApi } from './api';
import { getAuthGateway, type AuthGateway, type AuthUser } from './auth';
import { getBeautyApi } from './client';
import { productRoleLabel, shellRoleFor, type BeautyRole } from './models';

export type SessionState = {
  status: 'loading' | 'signedOut' | 'signedIn';
  role?: BeautyRole;
  productRole?: string;
  displayName?: string;
  tenantId?: string;
  tenantName?: string;
  centerCode?: string;
  branchId?: string;
  branchName?: string;
  customerId?: string;
  staffId?: string;
  error?: string;
  /** Centre code typed on the customer sign-in form, linked right after phone verification. */
  pendingCenterCode?: string;
};

type SessionActions = {
  start(): () => void;
  acceptUser(user: AuthUser): Promise<void>;
  setPendingCenterCode(code: string | undefined): void;
  setError(error: string | undefined): void;
  signOut(): Promise<void>;
};

const signedOut: SessionState = { status: 'signedOut' };

type Deps = { api: () => BeautyApi; gateway: () => AuthGateway | null };

export function createSessionStore(deps: Deps = { api: getBeautyApi, gateway: getAuthGateway }) {
  return create<SessionState & SessionActions>()((set, get) => ({
    status: deps.gateway() ? 'loading' : 'signedOut',

    start() {
      const gateway = deps.gateway();
      if (!gateway) {
        set({ ...signedOut, error: undefined });
        return () => undefined;
      }
      gateway.requestPushPermission().catch(() => undefined);
      return gateway.onAuthStateChanged((user) => {
        if (!user) {
          set({ ...signedOut, error: get().error, pendingCenterCode: get().pendingCenterCode });
          return;
        }
        // Errors are surfaced through `error`; the sign-in screen lets the user retry.
        get()
          .acceptUser(user)
          .catch(() => undefined);
      });
    },

    async acceptUser(user) {
      const pendingCenterCode = get().pendingCenterCode;
      set({ status: 'loading', error: undefined });
      try {
        const api = deps.api();
        if (pendingCenterCode) {
          await api.connectCustomer(pendingCenterCode);
        }
        // Refresh so tenant claims written by MainApi are part of the next token.
        await user.getIdToken(true);
        const profile = await api.session();
        if (!profile.assigned || !profile.productRole) {
          throw new Error(
            'Hesabınız bir güzellik merkezi profiline bağlanmamış. Merkez yöneticinizden mobil erişim tanımlamasını isteyin.',
          );
        }
        set({
          status: 'signedIn',
          role: shellRoleFor(profile.productRole),
          productRole: profile.productRole,
          displayName: profile.displayName || user.displayName || user.phoneNumber || user.email || undefined,
          tenantId: profile.tenantId,
          tenantName: profile.tenantName,
          centerCode: profile.centerCode,
          branchId: profile.branchId,
          branchName: profile.branchName,
          customerId: profile.customerId,
          staffId: profile.staffId,
          error: undefined,
          pendingCenterCode: undefined,
        });
      } catch (error) {
        const message = errorMessage(error);
        set({ ...signedOut, error: message, pendingCenterCode: undefined });
        // Drop the Firebase session too, so the next sign-in attempt starts clean.
        await deps
          .gateway()
          ?.signOut()
          .catch(() => undefined);
        set({ error: message });
        throw error;
      }
    },

    setPendingCenterCode(code) {
      set({ pendingCenterCode: code });
    },

    setError(error) {
      set({ error });
    },

    async signOut() {
      await deps.gateway()?.signOut();
      set({ ...signedOut, error: undefined, pendingCenterCode: undefined });
    },
  }));
}

export const useSession = createSessionStore();

export const sessionRoleLabel = (state: Pick<SessionState, 'productRole' | 'role'>) =>
  productRoleLabel(state.productRole, state.role);

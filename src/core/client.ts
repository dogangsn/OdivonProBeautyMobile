import { randomUUID } from 'expo-crypto';

import { createBeautyApi, type BeautyApi } from './api';
import { getAuthGateway } from './auth';

let api: BeautyApi | undefined;

export function getBeautyApi(): BeautyApi {
  if (!api) {
    api = createBeautyApi({
      getToken: async () => {
        const gateway = getAuthGateway();
        if (!gateway) {
          throw new Error('Firebase yapılandırması etkin değil. ENABLE_FIREBASE=true ile derleyin.');
        }
        return (await gateway.currentUser()?.getIdToken()) ?? null;
      },
      idempotencyKey: randomUUID,
    });
  }
  return api;
}

export function setBeautyApi(next: BeautyApi | undefined): void {
  api = next;
}

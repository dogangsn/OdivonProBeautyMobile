import Constants from 'expo-constants';

type Extra = { firebaseEnabled?: boolean; mainApiUrl?: string };

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const appConfig = {
  firebaseEnabled: extra.firebaseEnabled === true,
  mainApiUrl: extra.mainApiUrl ?? 'https://mainapi.odivon.com/api/v1/beauty',
} as const;

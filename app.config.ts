import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import type { ConfigContext, ExpoConfig } from 'expo/config';

const DEFAULT_MAIN_API_URL = 'https://mainapi.odivon.com/api/v1/beauty';
const ANDROID_GOOGLE_SERVICES = process.env.GOOGLE_SERVICES_JSON ?? './google-services.json';
const IOS_GOOGLE_SERVICES = process.env.GOOGLE_SERVICE_INFO_PLIST ?? './GoogleService-Info.plist';

/**
 * Firebase is opt-in, exactly like the old `--dart-define=ENABLE_FIREBASE=true` flag.
 * Without it the app builds in a safe unconfigured mode: no native Firebase config is
 * injected and the sign-in screen reports that authentication is unavailable.
 */
const firebaseRequested = process.env.ENABLE_FIREBASE === 'true';
const hasAndroidConfig = existsSync(resolve(process.cwd(), ANDROID_GOOGLE_SERVICES));
const hasIosConfig = existsSync(resolve(process.cwd(), IOS_GOOGLE_SERVICES));
const firebaseEnabled = firebaseRequested && (hasAndroidConfig || hasIosConfig);

const firebasePlugins: ExpoConfig['plugins'] = firebaseEnabled
  ? ['@react-native-firebase/app', '@react-native-firebase/auth', '@react-native-firebase/messaging']
  : [];

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Odivon Beauty',
  slug: 'odivonpro-beauty',
  scheme: 'odivonbeauty',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: 'com.odivonpro.beauty',
    supportsTablet: true,
    ...(firebaseEnabled && hasIosConfig ? { googleServicesFile: IOS_GOOGLE_SERVICES } : {}),
  },
  android: {
    package: 'com.odivonpro.beauty',
    adaptiveIcon: {
      backgroundColor: '#17112E',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    ...(firebaseEnabled && hasAndroidConfig ? { googleServicesFile: ANDROID_GOOGLE_SERVICES } : {}),
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      { image: './assets/splash-icon.png', imageWidth: 200, resizeMode: 'contain', backgroundColor: '#17112E' },
    ],
    '@react-native-community/datetimepicker',
    ['expo-build-properties', { ios: { useFrameworks: 'static' } }],
    ...firebasePlugins,
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    firebaseEnabled,
    mainApiUrl: process.env.MAIN_API_URL ?? DEFAULT_MAIN_API_URL,
  },
});

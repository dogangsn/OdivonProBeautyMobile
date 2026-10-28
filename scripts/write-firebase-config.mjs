// Generates google-services.json from the same secrets the Flutter build used
// (FIREBASE_API_KEY, FIREBASE_ANDROID_APP_ID, FIREBASE_MESSAGING_SENDER_ID,
// FIREBASE_PROJECT_ID, FIREBASE_STORAGE_BUCKET), so nothing is committed.
import { writeFileSync } from 'node:fs';

const env = process.env;
const appId = env.FIREBASE_ANDROID_APP_ID ?? env.FIREBASE_APP_ID;
const required = {
  FIREBASE_API_KEY: env.FIREBASE_API_KEY,
  FIREBASE_ANDROID_APP_ID: appId,
  FIREBASE_MESSAGING_SENDER_ID: env.FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID: env.FIREBASE_PROJECT_ID,
};
const missing = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length > 0) {
  console.log(`Firebase config skipped, missing: ${missing.join(', ')}. Building in unconfigured mode.`);
  process.exit(0);
}

const config = {
  project_info: {
    project_number: env.FIREBASE_MESSAGING_SENDER_ID,
    project_id: env.FIREBASE_PROJECT_ID,
    storage_bucket: env.FIREBASE_STORAGE_BUCKET ?? '',
  },
  client: [
    {
      client_info: {
        mobilesdk_app_id: appId,
        android_client_info: { package_name: 'com.odivonpro.beauty' },
      },
      oauth_client: [],
      api_key: [{ current_key: env.FIREBASE_API_KEY }],
      services: { appinvite_service: { other_platform_oauth_client: [] } },
    },
  ],
  configuration_version: '1',
};

writeFileSync('google-services.json', `${JSON.stringify(config, null, 2)}\n`);
console.log('google-services.json written.');

# OdivonProBeauty Mobile

React Native (Expo SDK 58, TypeScript) client for customers, specialists and managers. All business data goes through MainApi `/api/v1/beauty`. Firebase Authentication and FCM are only enabled when the app is built with `ENABLE_FIREBASE=true` and a Firebase native config file.

```bash
npm install
npm run typecheck
npm run lint
npm test
npm run android   # builds a development client (expo run:android)
```

This app uses native modules (React Native Firebase), so it runs in a development build, not in Expo Go.

## Firebase configuration

No Firebase file is committed. For Android, `scripts/write-firebase-config.mjs` writes `google-services.json` from `FIREBASE_API_KEY`, `FIREBASE_ANDROID_APP_ID`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_PROJECT_ID` and `FIREBASE_STORAGE_BUCKET` (the same GitHub Actions secrets the Flutter build used). For iOS, place `GoogleService-Info.plist` in the project root or point `GOOGLE_SERVICE_INFO_PLIST` at it. Then build with `ENABLE_FIREBASE=true`. `MAIN_API_URL` overrides the API base URL.

When the secrets are absent, the CI APK stays in safe unconfigured mode and clearly reports that authentication is unavailable; it never substitutes demo business data.

The sign-in screen has two server-authorized flows: customers use phone OTP plus their centre code, while staff and managers use email/password. After Firebase authentication, `/api/v1/beauty/me` resolves the tenant, beauty role, branch and linked customer/staff card. The client never guesses a role from token claims.

See [architecture](docs/architecture.md), [API and data](docs/api-data-and-permissions.md), [screens](docs/screens-and-wireframes.md), [product rules](docs/product-scope.md) and [testing/roadmap](docs/testing-and-roadmap.md). No license is granted by this repository.

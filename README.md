# OdivonProBeauty Mobile

Flutter Material 3 client for customers, specialists and managers. The application uses Firebase Authentication and FCM only when built with `--dart-define=ENABLE_FIREBASE=true`; all business data goes through `/api/v1/beauty`.

```bash
flutter pub get
flutter analyze
flutter test
flutter build apk --debug
```

The Android build reads Firebase configuration from Dart defines instead of committing `google-services.json`. Add `FIREBASE_API_KEY`, `FIREBASE_ANDROID_APP_ID`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_PROJECT_ID` and `FIREBASE_STORAGE_BUCKET` as GitHub Actions secrets. When they are absent, the CI APK remains in safe unconfigured mode and clearly reports that authentication is unavailable; it never substitutes demo business data.

The sign-in screen has two server-authorized flows: customers use phone OTP, while staff and managers use email/password. After Firebase authentication, `/api/v1/beauty/me` resolves the tenant, beauty role, branch and linked customer/staff card. The client never guesses a role from token claims.

See [architecture](docs/architecture.md), [API and data](docs/api-data-and-permissions.md), [screens](docs/screens-and-wireframes.md), [product rules](docs/product-scope.md) and [testing/roadmap](docs/testing-and-roadmap.md). No license is granted by this repository.

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

# OdivonProBeauty Mobile

Flutter Material 3 client for customers, specialists and managers. The application uses Firebase Authentication and FCM only when built with `--dart-define=ENABLE_FIREBASE=true`; all business data goes through `/api/v1/beauty`.

```bash
flutter pub get
flutter analyze
flutter test
flutter build apk --debug
```

Without Firebase project files, the app deliberately starts in safe demo mode. It performs no real SMS, payment, messaging or AI provider call and does not persist health or finance data. Android package ID is `com.odivonpro.beauty`; iOS source and CI-compatible project files are included, while signing requires macOS and Apple credentials.

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

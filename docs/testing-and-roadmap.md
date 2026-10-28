# Testing, CI and roadmap

Jest (`jest-expo`) unit tests cover models, the MainApi client envelope and error handling, session/role state and role navigation; React Native Testing Library tests cover the sign-in surface. Integration coverage targets Firebase ID-token refresh, MainApi error envelopes, FCM consent and deep links. Acceptance journeys cover customer OTP/appointment/package/KVKK and staff check-in/session notes/photos/customer history/KPI.

GitHub Actions run analyzer, tests and Android debug build and upload the APK. iOS sources are retained, but signing and App Store builds require macOS credentials. CI contains no deployment step and no secrets.

Delivery phases follow the platform: foundation auth and schedules; packages/sessions and operational media; customer engagement and multi-branch analytics; approved AI/provider adapters and advanced loyalty. Real SMS, WhatsApp, payment, e-invoice and AI integrations remain off until a provider implementation and secret-management review are approved.

# Testing, CI and roadmap

Unit tests cover session/role state and repository decoding; widget tests cover role entry and guarded shell navigation. Integration coverage targets Firebase ID-token refresh, MainApi error envelopes, FCM consent and deep links. Acceptance journeys cover customer OTP/appointment/package/KVKK and staff check-in/session notes/photos/customer history/KPI.

GitHub Actions run analyzer, tests and Android debug build and upload the APK. iOS sources are retained, but signing and App Store builds require macOS credentials. CI contains no deployment step and no secrets.

Delivery phases follow the platform: foundation auth and schedules; packages/sessions and operational media; customer engagement and multi-branch analytics; approved AI/provider adapters and advanced loyalty. Real SMS, WhatsApp, payment, e-invoice and AI integrations remain off until a provider implementation and secret-management review are approved.

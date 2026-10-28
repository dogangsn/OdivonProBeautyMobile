# Product scope and acceptance

The role shells are built around the shared MainApi contract and cover the complete navigation surface for customer and staff journeys. Typed repository methods, bearer-token handling, role guards, light/dark theme, accessible navigation and FCM bootstrap are implemented.

Acceptance focuses on OTP/auth state, role routing, appointment lists, check-in commands, package balance presentation, customer privacy options and manager KPI entry points. Real SMS/WhatsApp/email/payment/e-invoice and AI calls must remain `not-configured` until approved providers and secrets are installed.

CI analyzes, tests and builds an Android debug APK. iOS source is checked for analyzer/test compatibility but cannot be signed on Windows. Releases must validate tenant isolation, device security, notification consent, screenshots, accessibility and store privacy declarations.

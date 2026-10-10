# API, data and permissions

Every business request targets `/api/v1/beauty` and uses the envelope `{ success, data, meta: { requestId } }`. Lists use cursor pagination. The app uses auth/me, appointments, appointment check-in/complete/reschedule/cancel, sessions, packages, notifications, media upload commands, dashboard and customer-portal endpoints. Branch commands require a server-validated `branchId`.

Firestore data remains under `tenants/{tenantId}/beauty*`; mobile has no Firestore business-data SDK path. Core collections are customers, health, analyses, consents, appointments, sessions, packages/usages, services, staff, rooms/devices, payments, inventory, commissions, notifications, media, audit and KVKK requests. Media is represented by metadata and short-lived signed transfer commands.

Customers read and update only their linked account, appointments, preferences, consents and packages. Specialists see their assigned appointments and authorized customer history and can record sessions. Managers see branch operations and KPI summaries. Health access requires its own permission and audit. Finance and health data are never placed in persistent mobile cache.

Owner/admin/reception/cashier/auditor roles are accepted by the shared server model but this mobile shell intentionally maps operational access to manager, specialist or customer experiences. MainApi remains authoritative for every CRUD and row-level decision.

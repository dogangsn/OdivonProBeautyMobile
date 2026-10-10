# Mobile architecture

`main` performs optional Firebase bootstrap and starts a Riverpod provider scope. `core` contains immutable models, session state and the typed MainApi repository. `screens` contains role-aware Material 3 surfaces. GoRouter redirects unauthenticated sessions to sign-in and builds the customer or staff/manager shell from the verified role.

Firebase Authentication supplies ID tokens and Firebase Cloud Messaging handles push registration. `MainApiBeautyRepository` sends bearer tokens only to `/api/v1/beauty`. Firestore and Storage are never called by mobile code. Photos and consent media use future signed MainApi upload commands.

The customer shell covers OTP entry, appointments, reschedule/cancel contracts, packages and remaining sessions, loyalty, notification preferences and KVKK. The staff shell covers daily appointments, check-in, session notes/photos, authorized customer history, KPI summaries and notifications. Health and finance payloads use memory only and are not written to device cache.

External adapters and Firebase project files are intentionally absent. The default build exposes clearly labeled demo data; enabling Firebase requires environment-specific configuration supplied outside source control.

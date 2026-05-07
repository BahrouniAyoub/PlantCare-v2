# PlantCare Live - Project Report

## 1. Executive Summary

PlantCare Live is an Expo React Native application for monitoring plants with simulated IoT devices. Users can sign up, add plants, create a simulated sensor device, view live-style telemetry, trigger watering, receive alerts, and switch simulation scenarios such as dry plant, overwatered, hot day, low tank, and offline device.

The project is currently a frontend-heavy mobile/web app backed directly by Supabase. There is no local Express/Nest/Fastify backend, no MongoDB code, and no server-side API in this repository. Data persistence, authentication, and generated REST APIs are provided by Supabase.

The app is suitable for a demo if the Supabase project has the expected tables, policies, and seed/default values. It is not production-ready yet because database schema/migrations are missing from the repo, route protection is incomplete, row ownership enforcement depends entirely on unseen Supabase RLS policies, simulation runs in the client, and several settings/actions are placeholders.

## 2. Tech Stack

| Area | Technology | Evidence |
| --- | --- | --- |
| Frontend framework | Expo SDK 54, React Native 0.81, React 19 | `package.json` |
| Routing | Expo Router 6 | `package.json`, `app/_layout.tsx` |
| Backend framework | None in repository | No server folder, no backend package, no route/controller files |
| Database | Supabase PostgreSQL | `lib/supabase.ts`, Supabase table calls throughout app |
| Authentication | Supabase Auth email/password | `store/authStore.ts` |
| State management | Zustand | `store/authStore.ts` |
| API communication | Supabase JavaScript SDK | `lib/supabase.ts`, `supabase.from(...)`, `supabase.auth...` |
| Persistent auth storage | React Native AsyncStorage via Supabase client | `lib/supabase.ts` |
| UI libraries | React Native StyleSheet, Lucide icons, Expo Linear Gradient | `package.json`, components/screens |
| Tooling | TypeScript, Expo CLI, Expo lint | `package.json`, `tsconfig.json` |
| Simulation | Client-side interval engine | `hooks/useSimulation.ts`, `services/simulation.ts` |

## 3. Project Structure

| Path | Purpose |
| --- | --- |
| `app/` | Expo Router app routes and screens |
| `app/_layout.tsx` | Root stack navigator and Supabase auth session initialization |
| `app/index.tsx` | Onboarding/landing screen |
| `app/(auth)/` | Login and signup route group |
| `app/(tabs)/` | Main tab navigation: Home, My Plants, Alerts, Settings |
| `app/add-plant.tsx` | Modal screen for creating plants and optional simulated devices |
| `app/plant/[id].tsx` | Plant detail screen with telemetry, alerts, watering, deletion |
| `app/device/[id].tsx` | Device detail and simulation scenario controls |
| `components/` | Reusable UI and domain components |
| `components/ui/` | Generic UI primitives: Button, Input, Card, Badge, EmptyState, HealthBar, SensorCard |
| `constants/theme.ts` | Central colors, spacing, typography, radii, shadows |
| `hooks/` | Custom hooks for app readiness, plant loading, simulation ticking |
| `lib/supabase.ts` | Supabase client setup and AsyncStorage auth persistence |
| `services/simulation.ts` | Telemetry simulation, alert generation, watering behavior |
| `store/authStore.ts` | Zustand auth/profile store |
| `types/index.ts` | TypeScript interfaces for app data models |
| `.env` | Public Supabase URL and anon key |
| `app.json` | Expo configuration |
| `package.json` | Scripts and dependencies |
| `tsconfig.json` | Strict TypeScript config and `@/*` path alias |

Missing structure: there is no `server/`, `backend/`, `api/`, `controllers/`, `middleware/`, `models/`, `routes/`, `migrations/`, `supabase/`, or database schema directory.

## 4. Frontend Analysis

### App Navigation

Navigation uses Expo Router file-based routes.

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `app/index.tsx` | Onboarding/landing screen; redirects authenticated users to `/(tabs)` |
| `/(auth)/login` | `app/(auth)/login.tsx` | Email/password login |
| `/(auth)/signup` | `app/(auth)/signup.tsx` | Account creation and profile insert |
| `/(tabs)` | `app/(tabs)/index.tsx` | Dashboard/home tab |
| `/(tabs)/plants` | `app/(tabs)/plants.tsx` | Plant list tab |
| `/(tabs)/alerts` | `app/(tabs)/alerts.tsx` | Alerts tab |
| `/(tabs)/settings` | `app/(tabs)/settings.tsx` | Settings tab |
| `/add-plant` | `app/add-plant.tsx` | Modal plant creation flow |
| `/plant/[id]` | `app/plant/[id].tsx` | Plant detail |
| `/device/[id]` | `app/device/[id].tsx` | Device detail and simulation scenario selection |
| `+not-found` | `app/+not-found.tsx` | Not-found fallback |

Important issue: authenticated routes are not guarded at the route/layout level. `app/index.tsx` redirects authenticated users forward, but unauthenticated users can still attempt to navigate directly to tabs/detail screens. Most data fetches return nothing if no user is available or rely on RLS, but the UI does not consistently redirect unauthenticated access back to login.

### Screens/Pages

| Screen | Main behavior |
| --- | --- |
| Onboarding | Marketing hero, feature chips, sign up/login links |
| Login | Client validation, Supabase password sign-in, redirect to tabs |
| Signup | Client validation, Supabase sign-up, insert into `profiles`, redirect to tabs |
| Home | Polls counts for plants, devices, unread alerts every 10 seconds |
| Plants | Polls plant list every 5 seconds, displays cards and empty state |
| Alerts | Polls alerts every 10 seconds, mark one/all read |
| Settings | Shows profile, sign out, notification/dark mode toggles, placeholder rows |
| Add Plant | Inserts `plants`, optionally inserts `devices`, links plant to device, seeds telemetry |
| Plant Detail | Reads plant, latest telemetry, irrigation history, alerts; supports manual watering, auto-water toggle, delete |
| Device Detail | Reads device/latest telemetry, changes simulation scenario, resets simulation |

### Reusable Components

| Component | File | Purpose |
| --- | --- | --- |
| `PlantCard` | `components/PlantCard.tsx` | Plant tile with image, health, telemetry, device status |
| `AlertItem` | `components/AlertItem.tsx` | Alert row with severity/type icon and mark-read action |
| `Button` | `components/ui/Button.tsx` | Variant/size/loading button |
| `Input` | `components/ui/Input.tsx` | Text input with label, icon, error, password visibility |
| `Card` | `components/ui/Card.tsx` | Styled container variants |
| `Badge` | `components/ui/Badge.tsx` | Status/severity label |
| `EmptyState` | `components/ui/EmptyState.tsx` | Centered empty-state view |
| `HealthBar` | `components/ui/HealthBar.tsx` | 0-100 health progress bar |
| `SensorCard` | `components/ui/SensorCard.tsx` | Sensor metric card |

### API Service Layer

There is no conventional API service abstraction. Components and hooks call Supabase directly.

Primary data access locations:

| File | Data access |
| --- | --- |
| `store/authStore.ts` | Supabase auth and `profiles` table |
| `hooks/usePlants.ts` | `plants`, related `devices`, related `telemetry_readings` |
| `app/(tabs)/index.tsx` | Dashboard counts from `plants`, `devices`, `alerts` |
| `app/(tabs)/alerts.tsx` | Alert list and read updates |
| `app/add-plant.tsx` | Plant/device/telemetry creation |
| `app/plant/[id].tsx` | Plant detail, telemetry, irrigation, alerts, device updates, delete |
| `app/device/[id].tsx` | Device detail, scenario updates, telemetry seed |
| `services/simulation.ts` | Simulation inserts/updates across telemetry, devices, irrigation, alerts |

### Auth Handling

Authentication is implemented with Supabase Auth and Zustand.

| File | Behavior |
| --- | --- |
| `lib/supabase.ts` | Creates Supabase client with AsyncStorage, token auto-refresh, persisted sessions |
| `store/authStore.ts` | Provides `signUp`, `signIn`, `signOut`, `loadProfile`, and auth state |
| `app/_layout.tsx` | Subscribes to `supabase.auth.onAuthStateChange`, loads current session on mount |

Signup flow:

| Step | Code |
| --- | --- |
| Create auth user | `supabase.auth.signUp({ email, password })` in `store/authStore.ts` |
| Insert profile | `supabase.from('profiles').insert({ id: data.user.id, name })` |
| Load profile | Reads `profiles` by auth user id |

Potential issue: if Supabase requires email confirmation, `signUp` may return a user/session state that does not allow immediate authenticated inserts depending on project settings. The profile insert may fail unless RLS policies allow it at signup time.

### State Management

Global state is limited to auth/profile in `store/authStore.ts`. Plants, alerts, device data, telemetry, and UI toggles are screen-local state. There is no centralized cache, query library, or offline queue.

### Styling System

Styling uses React Native `StyleSheet` and centralized design tokens from `constants/theme.ts`. Colors, typography, spacing, border radius, and shadows are consistent across most screens. There is no NativeWind/Tailwind usage despite the Expo app name `bolt-expo-nativewind`.

### Assets

The code references `./assets/images/icon.png` and `./assets/images/favicon.png` in `app.json`, but these files were not present in the glob results. Plant photos are loaded from remote Pexels URLs in `app/index.tsx`, `app/add-plant.tsx`, and `components/PlantCard.tsx`.

### Frontend Errors or Missing Parts

| Issue | Evidence | Impact |
| --- | --- | --- |
| Route protection incomplete | No auth guard in `app/(tabs)/_layout.tsx`, `app/plant/[id].tsx`, `app/device/[id].tsx` | Unauthenticated users can reach protected UI; security relies on Supabase RLS |
| Settings rows are placeholders | Empty `onPress={() => {}}` in `app/(tabs)/settings.tsx` | Profile, privacy, about, simulation explanation are not implemented |
| Dark mode toggle is non-functional | `value={false}` and no-op handler in `settings.tsx` | UI advertises missing feature |
| Push notifications toggle is local only | `useState(true)` in `settings.tsx` | Preference is not saved and no notification integration exists |
| Error handling often ignores Supabase errors | Several fetch/update calls do not inspect `error` | Failures may silently show stale or empty UI |
| External image dependency | Pexels URLs used directly | Requires network; not stable/offline-safe |
| Typecheck could not run | `npm run typecheck` failed with `tsc` not recognized | Dependencies likely not installed or local tooling unavailable |
| Potential web runtime issue | `useFrameworkReady.ts` references `window` unguarded | Native runtime may fail if `window` is undefined, unless Expo environment polyfills it |

## 5. Backend Analysis

There is no local backend implementation in this repository.

| Backend Area | Status |
| --- | --- |
| Server entry point | Missing |
| Routes | Missing local server routes; Supabase generated APIs are used instead |
| Controllers | Missing |
| Middleware | Missing |
| Models | Missing local ORM/models; TypeScript interfaces exist in `types/index.ts` |
| Services | Only frontend simulation service in `services/simulation.ts` |
| Database connection | Supabase client in `lib/supabase.ts` |
| Authentication | Supabase Auth client-side integration |
| Validation | Basic client-side form validation only |
| Error handling | Mostly local `try/finally`; inconsistent error inspection |

Because Supabase is used directly from the app, security and validation must be enforced by Supabase Auth, Row Level Security policies, constraints, triggers, and database defaults. Those definitions are not present in the repository, so they require manual checking in the Supabase dashboard or exported migrations.

## 6. Database Design

The database design below is inferred from `types/index.ts` and Supabase table usage. There are no local migration files, SQL schema files, or Supabase type-generation files in the repo.

### `profiles`

| Field | Type inferred | Notes |
| --- | --- | --- |
| `id` | UUID/string | Same as Supabase auth user id |
| `name` | string | Inserted during signup |
| `created_at` | timestamp/string | Expected by `Profile` type |
| `email` | not stored or optional | Added client-side from Supabase user email in `loadProfile` |

Relationship: one profile belongs to one Supabase auth user.

### `plants`

| Field | Type inferred | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `owner_id` | UUID/string | Auth user id |
| `name` | string | Required by UI |
| `species` | string | Optional in UI but typed as string |
| `image_url` | string | Remote URL |
| `location` | string | Optional in UI but typed as string |
| `notes` | string | Optional in UI but typed as string |
| `health_score` | number | Created as `85`, shown in health bar |
| `device_id` | UUID/string/null | Linked after creating device |
| `created_at` | timestamp/string | Used for ordering |

Relationships: one plant belongs to one owner; one plant may have one linked device; one plant has many telemetry readings, alerts, and irrigation events.

### `devices`

| Field | Type inferred | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `owner_id` | UUID/string | Auth user id |
| `plant_id` | UUID/string/null | Plant association |
| `name` | string | Defaults to `{Plant Name} Sensor` in UI |
| `type` | `'simulated'` | Only simulated devices are supported |
| `status` | `'online'` or `'offline'` | Driven by simulation/scenario |
| `scenario` | simulation enum | Normal, dry, overwatered, hot, low tank, offline |
| `automation_enabled` | boolean | Auto-watering toggle |
| `min_moisture` | number | Used in auto-watering logic; not inserted in UI, likely requires DB default |
| `max_moisture` | number | Typed but not actively used |
| `last_seen_at` | timestamp/string | Updated by simulation tick |
| `created_at` | timestamp/string | Expected by type |

Relationships: one device belongs to one owner; one device may belong to one plant; one device has many telemetry readings, alerts, and irrigation events.

### `telemetry_readings`

| Field | Type inferred | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `owner_id` | UUID/string | Auth user id |
| `device_id` | UUID/string | Device association |
| `plant_id` | UUID/string/null | Plant association |
| `soil_moisture` | number | Percentage |
| `temperature` | number | Celsius |
| `humidity` | number | Percentage |
| `tank_level` | number | Percentage |
| `pump_on` | boolean | Whether pump is active for this reading |
| `created_at` | timestamp/string | Used for latest reading sorting |

Relationships: telemetry belongs to owner, device, and optionally plant.

### `irrigation_events`

| Field | Type inferred | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `owner_id` | UUID/string | Auth user id |
| `device_id` | UUID/string | Device association |
| `plant_id` | UUID/string/null | Plant association |
| `duration_seconds` | number | Inserted as `10` |
| `trigger_type` | `'manual'` or `'automatic'` | Source of watering |
| `success` | boolean | Inserted as `true` for successful watering |
| `message` | string | Human-readable event message |
| `created_at` | timestamp/string | Used for history |

Relationships: irrigation event belongs to owner, device, and optionally plant.

### `alerts`

| Field | Type inferred | Notes |
| --- | --- | --- |
| `id` | UUID/string | Primary key |
| `owner_id` | UUID/string | Auth user id |
| `device_id` | UUID/string/null | Device association |
| `plant_id` | UUID/string/null | Plant association |
| `type` | alert enum | Dry soil, overwatered, low tank, device offline, pump error, info |
| `severity` | alert severity enum | Low, medium, high, critical |
| `title` | string | Display title |
| `message` | string | Display body |
| `is_read` | boolean | Mark-read state; likely needs DB default `false` |
| `created_at` | timestamp/string | Used for ordering and duplicate suppression |

Relationships: alert belongs to owner and optionally device/plant. Alerts screen joins `plant:plants(name)`.

## 7. API Documentation

There is no custom REST API in this repository. The app uses Supabase Auth and Supabase PostgREST through `@supabase/supabase-js`. URLs below are the generated Supabase endpoints implied by SDK usage.

| Method | URL | Purpose | Auth required | Request body | Response |
| --- | --- | --- | --- | --- | --- |
| POST | `{SUPABASE_URL}/auth/v1/signup` | Create user account | No | `{ email, password }` | Supabase auth user/session or confirmation response |
| POST | `{SUPABASE_URL}/auth/v1/token?grant_type=password` | Sign in with email/password | No | `{ email, password }` | Supabase auth user/session |
| POST | `{SUPABASE_URL}/auth/v1/logout` | Sign out | Yes | None | Empty/success response |
| GET | `{SUPABASE_URL}/auth/v1/user` | Get current user | Yes | None | Current auth user |
| POST | `{SUPABASE_URL}/rest/v1/profiles` | Insert profile after signup | Yes or policy-dependent | `{ id, name }` | Inserted profile or error |
| GET | `{SUPABASE_URL}/rest/v1/profiles?id=eq.{userId}` | Load profile | Yes | None | Single profile row |
| GET | `{SUPABASE_URL}/rest/v1/plants?owner_id=eq.{userId}` | Dashboard plant count and health stats | Yes | None | Plant rows with `id`, `health_score` |
| GET | `{SUPABASE_URL}/rest/v1/plants?select=*,device:devices(*),latest_telemetry:telemetry_readings(*)&order=created_at.desc` | Load plant list | Yes | None | Plant rows with related device and telemetry rows |
| POST | `{SUPABASE_URL}/rest/v1/plants` | Create plant | Yes | `{ owner_id, name, species, location, notes, image_url, health_score }` | Created plant row |
| PATCH | `{SUPABASE_URL}/rest/v1/plants?id=eq.{plantId}` | Link device to plant | Yes | `{ device_id }` | Updated plant row/status |
| DELETE | `{SUPABASE_URL}/rest/v1/plants?id=eq.{plantId}` | Delete plant | Yes | None | Delete status |
| GET | `{SUPABASE_URL}/rest/v1/plants?id=eq.{plantId}&select=*,device:devices(*)` | Load plant detail | Yes | None | Plant row with device |
| GET | `{SUPABASE_URL}/rest/v1/devices?owner_id=eq.{userId}` | Dashboard device count | Yes | None | Device rows with `id`, `status` |
| POST | `{SUPABASE_URL}/rest/v1/devices` | Create simulated device | Yes | `{ owner_id, plant_id, name, type, status, scenario, automation_enabled }` | Created device row |
| GET | `{SUPABASE_URL}/rest/v1/devices?id=eq.{deviceId}` | Load device detail | Yes | None | Device row |
| PATCH | `{SUPABASE_URL}/rest/v1/devices?id=eq.{deviceId}` | Change scenario/status, automation, last seen | Yes | Partial device fields | Updated status/row |
| GET | `{SUPABASE_URL}/rest/v1/devices?owner_id=eq.{userId}&type=eq.simulated` | Fetch simulated devices for client tick | Yes | None | Device rows |
| POST | `{SUPABASE_URL}/rest/v1/telemetry_readings` | Seed or append telemetry | Yes | `{ owner_id, device_id, plant_id, soil_moisture, temperature, humidity, tank_level, pump_on }` | Insert status/row |
| GET | `{SUPABASE_URL}/rest/v1/telemetry_readings?device_id=eq.{deviceId}&order=created_at.desc&limit=1` | Latest device telemetry | Yes | None | Latest telemetry row |
| GET | `{SUPABASE_URL}/rest/v1/telemetry_readings?plant_id=eq.{plantId}&order=created_at.desc&limit=1` | Latest plant telemetry | Yes | None | Latest telemetry row |
| POST | `{SUPABASE_URL}/rest/v1/irrigation_events` | Record watering event | Yes | `{ owner_id, device_id, plant_id, duration_seconds, trigger_type, success, message }` | Insert status/row |
| GET | `{SUPABASE_URL}/rest/v1/irrigation_events?plant_id=eq.{plantId}&order=created_at.desc&limit=5` | Recent watering history | Yes | None | Irrigation event rows |
| GET | `{SUPABASE_URL}/rest/v1/alerts?owner_id=eq.{userId}` | Dashboard/alerts list | Yes | None | Alert rows |
| GET | `{SUPABASE_URL}/rest/v1/alerts?plant_id=eq.{plantId}&is_read=eq.false` | Active plant alerts | Yes | None | Unread alert rows |
| POST | `{SUPABASE_URL}/rest/v1/alerts` | Create generated alerts | Yes | `{ owner_id, device_id, plant_id, type, severity, title, message }` | Insert status/row |
| PATCH | `{SUPABASE_URL}/rest/v1/alerts?id=eq.{alertId}` | Mark one alert read | Yes | `{ is_read: true }` | Update status/row |
| PATCH | `{SUPABASE_URL}/rest/v1/alerts?owner_id=eq.{userId}&is_read=eq.false` | Mark all alerts read | Yes | `{ is_read: true }` | Update status/rows |

## 8. Current Features

| Feature | Status | Files |
| --- | --- | --- |
| Onboarding screen | Implemented | `app/index.tsx` |
| Email/password signup | Implemented via Supabase | `app/(auth)/signup.tsx`, `store/authStore.ts` |
| Email/password login/logout | Implemented via Supabase | `app/(auth)/login.tsx`, `app/(tabs)/settings.tsx`, `store/authStore.ts` |
| Profile display | Implemented if `profiles` row exists | `settings.tsx`, `authStore.ts` |
| Dashboard stats | Implemented | `app/(tabs)/index.tsx` |
| Plant list | Implemented | `app/(tabs)/plants.tsx`, `hooks/usePlants.ts` |
| Add plant | Implemented | `app/add-plant.tsx` |
| Simulated device creation | Implemented | `app/add-plant.tsx` |
| Initial telemetry seed | Implemented | `app/add-plant.tsx`, `app/device/[id].tsx` |
| Client-side telemetry simulation | Implemented | `hooks/useSimulation.ts`, `services/simulation.ts` |
| Plant detail | Implemented | `app/plant/[id].tsx` |
| Device detail | Implemented | `app/device/[id].tsx` |
| Scenario switching | Implemented | `app/device/[id].tsx` |
| Manual watering | Implemented | `app/plant/[id].tsx`, `services/simulation.ts` |
| Auto-watering simulation | Implemented client-side | `services/simulation.ts` |
| Alert generation | Implemented client-side for dry soil, overwatered, low tank | `services/simulation.ts` |
| Alert list and mark-read | Implemented | `app/(tabs)/alerts.tsx` |
| Delete plant | Implemented | `app/plant/[id].tsx` |

## 9. Missing or Incomplete Features

| Feature | Status | Evidence |
| --- | --- | --- |
| Local backend | Missing | No server files or backend package |
| Database migrations/schema | Missing | No SQL/migration/Supabase schema files |
| MongoDB connection | Missing/not used | No MongoDB dependencies or code |
| Protected route guard | Incomplete | No redirect guard in tab/detail layouts |
| Server-side simulation worker | Missing | Simulation explicitly runs in frontend in `useSimulation.ts` |
| Real hardware integration | Missing | Device type only supports `'simulated'` |
| MQTT integration | Missing | No MQTT dependency/config |
| ESP32 provisioning | Missing | No device registration/token flow |
| Push notifications | Mock/local only | Settings switch is local state only |
| Dark mode | Placeholder | Switch hard-coded false/no-op |
| Profile editing | Placeholder | Empty handler in settings |
| Privacy/security screen | Placeholder | Empty handler in settings |
| About/simulation help screens | Placeholder | Empty handlers in settings |
| Tests | Missing | No test scripts or test files found |
| CI/CD | Missing | No workflow/config files found |
| API service abstraction | Missing | Direct Supabase calls in screens/hooks |
| Offline support | Missing | No offline cache or sync queue |
| Health score recalculation | Incomplete | `health_score` is inserted as `85` and displayed, but not recalculated by telemetry |
| Device offline alerts | Incomplete | Type exists, but generation only handles dry soil, overwatered, low tank |
| Pump error alerts | Incomplete | Type exists, but no generation logic |

## 10. Bugs and Technical Issues

| Severity | Issue | Evidence | Risk/Fix |
| --- | --- | --- | --- |
| High | Typecheck cannot run in current workspace | `npm run typecheck` failed with `tsc` not recognized | Run `npm install`, then `npm run typecheck`; current local dependencies/tooling are not ready |
| High | No database schema/migrations in repo | Supabase tables are referenced but not defined locally | New environments cannot be recreated reliably |
| High | Ownership filters missing on detail/update/delete operations | `plant/[id].tsx` loads/deletes by `id`; `device/[id].tsx` loads/updates by `id`; `alerts.tsx` updates by alert `id` | Must rely on RLS; add `.eq('owner_id', user.id)` where possible and verify RLS |
| High | Client-driven simulation writes database records every 5 seconds | `useSimulation.ts` runs for every mounted authenticated client | Multiple clients can duplicate telemetry and alerts; move to server/Edge Function/cron for production |
| Medium | `usePlants.ts` does not filter by `owner_id` | `.from('plants').select(...)` with no owner filter | Data isolation depends entirely on RLS; add explicit user filter for clarity/performance |
| Medium | Supabase errors ignored in many operations | Several calls use only `{ data }` or no error check | Silent failures and stale UI |
| Medium | Auth state listener is not unsubscribed | `app/_layout.tsx` calls `onAuthStateChange` without cleanup | Potential duplicate listeners during reload/remount |
| Medium | `useFrameworkReady.ts` references `window` directly | `window.frameworkReady?.()` | May fail outside web-like contexts; guard with `typeof window !== 'undefined'` |
| Medium | Expected asset files may be missing | `app.json` references `assets/images/icon.png` and `favicon.png`, not found in project glob | Expo build/export may fail if assets are absent |
| Medium | App name/slug do not match product | `app.json` uses `bolt-expo-nativewind`; `package.json` uses `bolt-expo-starter` | Branding/config cleanup needed |
| Medium | Related telemetry query can be heavy | `usePlants.ts` selects all related telemetry then sorts client-side | Performance risk as telemetry grows; use a view/RPC/latest table |
| Medium | Device defaults are assumed | `min_moisture`, `max_moisture`, `last_seen_at`, `is_read`, timestamps not inserted | Requires DB defaults; otherwise UI may show undefined or inserts may fail |
| Low | Some text uses emoji/non-business copy | Home greeting/tip | Acceptable for demo, consider product tone later |
| Low | Remote images only | Pexels URLs | Offline/network dependency and licensing/availability concern |

No CORS issues are visible in local code because the app calls Supabase directly from the client. Any CORS restrictions are managed by Supabase/platform configuration.

## 11. Security Review

| Area | Assessment |
| --- | --- |
| JWT handling | Supabase SDK handles access/refresh tokens. Tokens are persisted in AsyncStorage via `lib/supabase.ts`. This is normal for mobile demos but less secure than platform secure storage. |
| Password hashing | Not implemented locally because Supabase Auth handles password storage and hashing. |
| Protected routes | Incomplete. There is no global authenticated route guard for tab/detail screens. |
| CORS | No custom backend CORS. Supabase APIs are called directly. |
| Environment variables | `.env` contains `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`. These are intentionally public in Expo, but committing `.env` is still poor hygiene and can expose project metadata. Never include service role keys in Expo public env vars. |
| Exposed secrets | No service role key found. The anon key is public by design but should be paired with strict RLS. |
| User/owner handling | Many inserts set `owner_id` from `user.id`. Some reads/updates/deletes do not filter by `owner_id`; Supabase RLS must enforce ownership. |
| Token storage | AsyncStorage persists sessions. Consider Expo SecureStore for stronger mobile storage if supported by Supabase auth storage adapter. |
| RLS dependency | Critical. Since the frontend talks directly to tables, every table must have RLS enabled with owner-scoped policies for select/insert/update/delete. Policies are not visible in this repo. |
| Input validation | Only simple client-side validation exists. Database constraints should enforce required fields, enum values, FK relationships, and ownership consistency. |
| Abuse risk | Client simulation can write unlimited telemetry while app is open. Rate limits or server-side simulation are needed for production. |

Security-critical manual checks in Supabase:

| Table | Required policy/constraint checks |
| --- | --- |
| `profiles` | Users can select/update/insert only their own profile where `id = auth.uid()` |
| `plants` | Users can CRUD only rows where `owner_id = auth.uid()` |
| `devices` | Users can CRUD only rows where `owner_id = auth.uid()` and linked plant belongs to same owner |
| `telemetry_readings` | Users can read/insert only own telemetry; consider preventing arbitrary client inserts in production |
| `irrigation_events` | Users can read/insert only own events |
| `alerts` | Users can read/update only own alerts; alert creation should eventually move server-side |

## 12. UI/UX Review

The visual design is clean and consistent for a Bolt-generated MVP. It uses a green plant-care theme, cards, badges, simple metrics, and accessible loading/empty states in major list screens.

Strengths:

| Area | Notes |
| --- | --- |
| Visual consistency | Shared colors, spacing, cards, buttons, badges |
| User flow | Clear onboarding, auth, add plant, view plant/device loop |
| Demo appeal | Simulated live data and scenario switching are easy to understand |
| Empty states | Plants and alerts include useful empty states |
| Loading states | Main list/detail screens show spinners or refresh controls |

Weaknesses:

| Area | Notes |
| --- | --- |
| Mobile responsiveness | Built for mobile portrait; web/tablet layouts are not deeply optimized |
| Accessibility | No explicit accessibility labels/roles on key controls |
| Settings UX | Multiple visible rows do nothing, which hurts trust |
| Error UX | Data-fetch failures are often silent |
| Telemetry UX | Polling every 5 seconds may feel live, but there is no chart/history visualization |
| Data freshness | No clear stale/offline indicator beyond device status |
| Dark mode | Advertised but not implemented |

## 13. Simulation / IoT Readiness

The app is good for a frontend-driven simulation demo. `hooks/useSimulation.ts` runs a 5-second interval for the current user's simulated devices and calls `runDeviceTick` from `services/simulation.ts`. The simulation generates telemetry, updates device status, triggers automatic watering, records irrigation events, and creates alerts.

It is not ready for real ESP32/MQTT hardware yet.

| Capability | Current status |
| --- | --- |
| Simulated telemetry | Implemented client-side |
| Scenario switching | Implemented |
| Manual watering | Simulated only |
| Auto-watering | Simulated only, client-driven |
| Real device identity/provisioning | Missing |
| MQTT broker/client | Missing |
| Device auth keys/certificates | Missing |
| Backend ingestion endpoint | Missing |
| Server-side command queue | Missing |
| Hardware status heartbeat | Simulated via `last_seen_at`; no real heartbeat ingestion |
| Telemetry retention strategy | Missing |

Recommended IoT path: move simulation to a backend worker first, then add a device ingestion API or MQTT bridge, then add command topics/queues for pump control.

## 14. Recommended Improvements

### Urgent Fixes

| Priority | Improvement |
| --- | --- |
| 1 | Add/export Supabase schema migrations, RLS policies, indexes, constraints, and seed/default values. |
| 2 | Install dependencies and fix any TypeScript errors after `npm install && npm run typecheck`. |
| 3 | Add route guards for authenticated screens and redirect unauthenticated users to login. |
| 4 | Add explicit `owner_id` filters to detail reads, updates, deletes, and list queries where possible. |
| 5 | Verify all Supabase RLS policies before demoing with real user data. |
| 6 | Remove placeholder settings rows or implement them. |

### Short-Term Improvements

| Priority | Improvement |
| --- | --- |
| 1 | Add centralized data/service functions instead of direct Supabase calls in screens. |
| 2 | Improve error handling and show user-visible error states for failed fetch/update actions. |
| 3 | Add database defaults for `created_at`, `is_read`, device thresholds, status, scenario, and IDs if not already present. |
| 4 | Add latest telemetry view/RPC to avoid loading all telemetry for each plant card. |
| 5 | Add basic tests for simulation logic and auth/store behavior. |
| 6 | Fix app branding in `package.json` and `app.json`. |

### Long-Term Improvements

| Priority | Improvement |
| --- | --- |
| 1 | Move simulation, alert generation, and auto-watering to Supabase Edge Functions, scheduled jobs, or a backend service. |
| 2 | Add real-time subscriptions for telemetry/alerts instead of polling. |
| 3 | Add MQTT or ingestion API for ESP32 devices. |
| 4 | Add command queue and acknowledgment flow for watering commands. |
| 5 | Add push notifications for critical alerts. |
| 6 | Add telemetry charts, historical analytics, thresholds per plant, and plant-care recommendations. |
| 7 | Add secure mobile token storage and stronger session handling. |

## 15. Roadmap

### Phase 1: Stabilize App

| Task | Outcome |
| --- | --- |
| Install dependencies and run typecheck/lint | Confirm code compiles |
| Export/create Supabase migrations | Reproducible database setup |
| Verify RLS policies | Safe multi-user data isolation |
| Add auth route guards | Protected user flows |
| Handle Supabase errors consistently | Better debugging and UX |
| Fix missing assets/branding | Build-ready Expo config |

### Phase 2: Complete MVP

| Task | Outcome |
| --- | --- |
| Implement/remove placeholder settings rows | No dead UI |
| Add profile edit | Basic account management |
| Add saved notification preferences | Real user preference storage |
| Add telemetry history/chart | More useful plant monitoring |
| Add threshold controls | User-configurable care rules |
| Add basic tests | Safer iteration |

### Phase 3: Improve Simulation

| Task | Outcome |
| --- | --- |
| Move simulation to server/Edge Function | No duplicate client-generated telemetry |
| Add scheduled simulation ticks | Reliable background behavior |
| Improve alert deduplication/resolution | Cleaner alert experience |
| Add health score calculation | Health reflects sensor data |
| Add scenario presets per plant/device | Better demo control |

### Phase 4: Prepare Real Hardware Integration

| Task | Outcome |
| --- | --- |
| Add device provisioning flow | Securely register ESP32 devices |
| Add hardware device type | Support non-simulated devices |
| Add MQTT broker or HTTP ingestion | Real telemetry ingestion |
| Add command queue | Reliable pump control |
| Add heartbeat/offline detection | Real device status |
| Add device credentials management | Safer IoT authentication |

### Phase 5: Production Readiness

| Task | Outcome |
| --- | --- |
| Add CI checks | Automated quality gates |
| Add monitoring/logging | Operational visibility |
| Add rate limits and abuse controls | Protect database/API |
| Add backup/retention policies | Data durability and cost control |
| Add privacy/security documentation | Launch readiness |
| Add app store/web deployment configs | Release readiness |

## 16. How to Run the Project

### Install Dependencies

```bash
npm install
```

### Set Up Environment Variables

Create or update `.env` in the project root:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Current `.env` already contains a Supabase URL and anon key. These values are public Expo variables, but the Supabase project must have strict RLS enabled.

### Connect Supabase/PostgreSQL

There are no local migrations. You must manually create or verify these Supabase tables before the app can work:

```text
profiles
plants
devices
telemetry_readings
irrigation_events
alerts
```

Required database setup:

| Requirement | Notes |
| --- | --- |
| Auth enabled | Supabase email/password auth must be enabled |
| RLS enabled | Enable RLS on all user data tables |
| Owner policies | Policies must restrict rows by `auth.uid()` |
| Defaults | Add UUID, timestamp, `is_read`, device thresholds, and status/scenario defaults as needed |
| Foreign keys | Link plants/devices/telemetry/events/alerts consistently |

### Start Frontend

```bash
npm run dev
```

This runs:

```bash
EXPO_NO_TELEMETRY=1 expo start
```

On Windows PowerShell, if the script has trouble with inline environment syntax, run one of these alternatives:

```powershell
$env:EXPO_NO_TELEMETRY="1"; npx expo start
```

```bash
npx expo start
```

### Start Backend

There is no local backend to start. Supabase is the backend service.

If you later add Supabase local development, typical commands would be separate from the current repo and require Supabase CLI setup. This repo does not include that configuration.

### Typecheck

```bash
npm run typecheck
```

Current result during inspection:

```text
operable program or batch file.
```

This indicates dependencies are not installed or local binaries are unavailable. Run `npm install` first.

### Lint

```bash
npm run lint
```

### Build Web Export

```bash
npm run build:web
```

### Testing API Manually

There are no custom API endpoints. To test Supabase-backed behavior:

| Test | Steps |
| --- | --- |
| Auth | Start app, create account via signup screen, verify user in Supabase Auth |
| Profile | Verify row inserted into `profiles` with `id = auth.users.id` |
| Add plant | Use Add Plant screen, verify rows in `plants`, `devices`, `telemetry_readings` |
| Simulation | Keep app open, verify new `telemetry_readings` every 5 seconds |
| Alerts | Set scenario to `dry_plant`, `overwatered`, or `low_tank`, verify rows in `alerts` |
| Watering | Tap Water Now, verify `telemetry_readings` and `irrigation_events` |

## 17. Environment Variables

| Variable | Required | Current source | Purpose | Security notes |
| --- | --- | --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | `.env`, `lib/supabase.ts` | Supabase project URL used by client SDK | Public by Expo design |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | `.env`, `lib/supabase.ts` | Supabase anonymous public API key used by client SDK | Public by Supabase design; safe only with strict RLS |

No variables for MongoDB, JWT secret, server port, CORS origins, MQTT broker, or backend API URL are used in this codebase.

## 18. Final Assessment

### What Works

| Area | Assessment |
| --- | --- |
| Frontend navigation | Mostly complete and coherent |
| Auth UI | Implemented for Supabase email/password |
| Plant/device CRUD basics | Add, list, view, delete plant; create/view/update device scenario |
| Simulation demo | Strong demo value with live-style readings and scenarios |
| Alerts | Basic generated alerts and mark-read flow work conceptually |
| UI polish | Good MVP-level design consistency |

### What Does Not Work or Is Not Proven

| Area | Assessment |
| --- | --- |
| Local backend | Does not exist |
| MongoDB | Not used |
| Reproducible database setup | Not possible from repo alone |
| Production security | Cannot be confirmed without Supabase RLS/schema review |
| TypeScript health | Could not be verified because `tsc` was unavailable |
| Real IoT hardware | Not implemented |
| Settings features | Several are placeholders |
| Server-side automation | Missing; automation is client-driven |

### Project Quality

The project is a solid Bolt-generated MVP frontend with good screen coverage, consistent styling, and a useful simulation concept. The main architectural weakness is that core business logic and background simulation run in the client while writing directly to Supabase tables. For a demo, this is acceptable. For production, simulation, alerting, validation, and hardware command handling should move server-side.

### Readiness for Demo

Demo readiness: moderate to high, assuming Supabase tables and RLS policies already exist and dependencies install correctly.

Demo blockers to check first:

| Check | Reason |
| --- | --- |
| Run `npm install` | TypeScript binary was missing |
| Run `npm run typecheck` | Catch compile errors |
| Verify Expo assets exist | `app.json` references icon/favicon paths |
| Verify Supabase schema/RLS | App depends on tables and ownership policies |
| Test signup with current Supabase settings | Email confirmation may affect profile insertion |

### Readiness for Production

Production readiness: low.

Reasons:

| Reason | Impact |
| --- | --- |
| No server/backend or Edge Function for simulation | Duplicate/untrusted client writes |
| No migrations/schema in repo | Cannot reproduce environments |
| Incomplete route protection | Poor auth boundary in app UX |
| Unknown RLS policies | Cannot verify user data isolation |
| No tests/CI | Regression risk |
| No real IoT architecture | Cannot support ESP32/MQTT safely yet |
| Placeholder settings | Incomplete product experience |

Final recommendation: stabilize the Supabase schema/RLS and build tooling first, then move simulation and alert logic out of the client before treating this as more than a demo MVP.

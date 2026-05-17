# PreventVital Mobile — Product & Engineering Document

**Version:** 1.0.0  
**Platform:** React Native (Expo) — iOS, Android, Web  
**API:** GCP Cloud Run (`preventvital-api-988713182018.asia-south1.run.app`)  
**Date:** May 2026

---

## Table of Contents

1. [What the App Is](#1-what-the-app-is)
2. [Tech Stack](#2-tech-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Current Features & Functionalities](#4-current-features--functionalities)
   - 4.1 Authentication & Onboarding
   - 4.2 CVITAL Health Assessment
   - 4.3 Health Dashboard
   - 4.4 Wearable & Device Integration
   - 4.5 Wellness Programs
   - 4.6 Shop & E-Commerce
   - 4.7 Subscription Tiers
   - 4.8 VIDA AI Chatbot
   - 4.9 Notifications
   - 4.10 Profile & Account Management
   - 4.11 Legal & Consent
5. [Known Gaps & Incomplete Items](#5-known-gaps--incomplete-items)
6. [New Features to Build](#6-new-features-to-build)
7. [Existing Functionality Improvements](#7-existing-functionality-improvements)
8. [Security Improvements](#8-security-improvements)
9. [Scalability Improvements](#9-scalability-improvements)
10. [Screen Inventory](#10-screen-inventory)
11. [API Inventory](#11-api-inventory)

---

## 1. What the App Is

PreventVital is a cardiovascular health platform targeting users who want clinical-grade insight into their heart health. The core value proposition is the **CVITAL™ score** — a composite 0–100 cardiovascular risk score derived from a 9-section clinical questionnaire covering blood pressure, lipid profile, HbA1c, lifestyle, family history, and biomarkers.

**Three pillars:** Trust (clinical accuracy), Comprehension (your score means something), Daily Utility (reason to open it tomorrow).

**Business model:** B2C subscription tiers (Free / Silver ₹499/mo / Gold ₹999/mo / Platinum ₹2499/mo) + B2B corporate plans + e-commerce (health devices, test kits, supplements via Razorpay).

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81.5 + Expo ~54 |
| Language | TypeScript 5.9 |
| Navigation | React Navigation 7 (native-stack + bottom-tabs) |
| State | Context API (AuthContext, ShopContext, LoadingContext, ConsentContext) |
| Networking | Axios 1.13 with Bearer token interceptor |
| Secure Storage | expo-secure-store (iOS/Android) / localStorage (web) |
| Local Persistence | @react-native-async-storage/async-storage |
| Animations | react-native-reanimated ~4.1 |
| Charts | react-native-svg (custom SparklineChart, CVITAL gauge) |
| Video | react-native-youtube-iframe |
| Payments | Razorpay (subscriptions + shop checkout) |
| Wearables | Apple HealthKit (iOS), Google Fit (OAuth, Android) |
| UI Extras | expo-linear-gradient, expo-haptics, expo-image |
| Date Picker | @react-native-community/datetimepicker |

---

## 3. Architecture Overview

```
App Entry
  └── AuthProvider
       └── LoadingProvider
            └── ShopProvider
                 └── ConsentProvider
                      └── AppNavigator
                           ├── AuthStack          (unauthenticated)
                           │    ├── WelcomeScreen
                           │    ├── LoginScreen
                           │    ├── SignUpScreen
                           │    ├── OtpVerificationScreen
                           │    └── ProfileSetupScreen
                           │
                           ├── ConsentStack       (logged in, no consent)
                           │    └── ConsentScreen
                           │
                           └── AppStack           (logged in + consented)
                                ├── BottomTabNavigator
                                │    ├── Home (HealthDashboardScreen)
                                │    ├── Programs (ProgramsListScreen)
                                │    ├── Shop (ShopScreen)
                                │    ├── Devices (DevicesScreen)
                                │    └── Profile (UserProfileScreen)
                                │
                                └── Modal/Push screens
                                     (WellnessScore, Assessment, Cart,
                                      Subscription, Notifications, etc.)

API Client (Axios)
  └── Base: GCP Cloud Run
  └── Auth interceptor: injects Bearer token from secure storage
  └── 60s timeout
```

---

## 4. Current Features & Functionalities

### 4.1 Authentication & Onboarding

**What exists:**
- Animated welcome screen with floating health-metric orbit icons
- Email + password sign-up with client-side validation (length, uppercase, lowercase, number, special character)
- Email + password login with backend pre-warm ping (reduces cold-start latency on Cloud Run)
- OTP screen exists in the flow but is mocked — it auto-passes after 1 second with a `mock_token` *(P0 bug — see §5)*
- Post-signup profile setup: age and gender
- Full extended profile: first/last name, DOB (date picker), gender chips, blood group chips, height, weight, city, country — saved to `/api/users/updateMe`
- Health conditions multi-select (diabetes, hypertension, cardiac, respiratory, mental health, kidney, liver, thyroid, obesity, arthritis)
- Health goals multi-select (glucose control, BP management, heart health, weight management, lung function, stress reduction, sleep improvement, exercise)
- Connect devices screen (Google Fit OAuth redirect, Apple Health)
- Consent gate: users must explicitly accept health data consent before accessing the app; stored in secure storage

**Auth mechanics:**
- JWT token stored in `expo-secure-store` (iOS/Android) or `localStorage` (web)
- Token auto-injected into every API request via Axios interceptor
- On app boot, token is read from storage → user & subscription fetched in parallel → navigation state set accordingly
- `currentPlan` is derived from subscription data (free / silver / gold / platinum / corporate)

---

### 4.2 CVITAL Health Assessment

**What exists:**
- 9-section clinical questionnaire:
  1. Personal Demographics (age, sex, ethnicity, family history)
  2. Body Measurements (height, weight, waist, hip — computes BMI and waist-hip ratio)
  3. Blood Pressure (systolic, diastolic, medication status, readings)
  4. Lipid Profile (total cholesterol, LDL, HDL, triglycerides)
  5. Diabetes Assessment (fasting glucose, HbA1c, medication)
  6. CVD History (prior MI, stroke, angina, stents, surgeries)
  7. Lifestyle Factors (smoking, alcohol, physical activity, sleep, diet quality)
  8. Advanced Biomarkers (CRP, creatinine, eGFR, uric acid)
  9. Organ Assessment (target organ damage, retinopathy, neuropathy)
- Progress bar across all 9 sections
- Section-by-section AsyncStorage draft saving (`pv_assessment_draft`) — users can exit and resume
- "Save & Exit" escape with reminder to return
- Resume detection on re-entry: "You have an unfinished assessment — continue where you left off?"
- Score calculation via `/api/vitals/calculate-score` on completion
- Results screen: CVITAL score (0–100), ASCVD risk %, vascular age, metabolic age, BMI category, body fat %, full tier breakdown with clinical recommendations
- Assessment history with score trend chart (SVG line graph) — locked behind Gold+ subscription
- Score bands:
  - 80–100: Excellent (low risk)
  - 60–79: Good (moderate-low risk)
  - 40–59: Fair (moderate risk)
  - 1–39: At Risk (high risk)

---

### 4.3 Health Dashboard

**What exists:**
- Personalized greeting (Good Morning / Afternoon / Evening) + user first name
- CVITAL score ring (SVG arc, gradient fill, dynamic color by tier)
- When score = 0: "Get your score" CTA taps directly to assessment
- "Today's Recommendation" card — fully score-driven:
  - Score 0 → complete assessment
  - Score < 40 → start cardiac program
  - Score 40–59 → lifestyle changes card
  - Score 60–79 → connect wearable to track toward Excellent
  - Score 80+ → maintain routine, re-assess quarterly
- Abnormal reading alerts (dismissable per-key):
  - SpO₂ < 90%: critical red banner
  - SpO₂ 90–94%: amber warning
  - HR > 100: elevated heart rate alert
  - HR < 50: bradycardia alert
  - BP > 140/90: hypertension alert
- Vital cards (Heart Rate, Blood Pressure, SpO₂, Activity/Steps) — prefer real wearable data, fall back to assessment data, then show `—`
- "Synced X min ago" timestamp next to vitals section
- Source badge ("Google Fit") when wearable data is present
- "Connect Google Fit to see live vitals" nudge strip when no wearable connected
- "Prescribed Modules" section: 2 time-appropriate session cards (morning, afternoon, evening) with embedded YouTube player
- Notification bell → `NotificationsScreen`
- Profile avatar → `UserProfileScreen`
- Quick Assess button in header

---

### 4.4 Wearable & Device Integration

**What exists:**

**Wearable Dashboard Screen:**
- Apple Health (iOS): full HealthKit permission request, live subscription to heart rate & SpO₂ streams, event log
- Google Fit (Android/Web): OAuth redirect to `/api/wearables/oauth/googlefit/login`, optimistic connect state, backend-synced history from `/api/wearables/history`
- Fitbit: "Coming Soon" alert — advises syncing via Google Fit / Apple Health
- boAt Watch: bridge via Apple Health (iOS) or Google Fit (Android)
- "No device connected" demo banner when no Apple or Google connection
- "Synced X min ago" timestamp
- SparklineChart (SVG) for HR and SpO₂ history from backend
- Live event log (source, timestamp, value)

**Devices Screen (tab):**
- Google Fit OAuth initiation and sync
- Apple Health connection and data pull
- Sync vitals to backend: `/api/wearables/sync/googlefit`, `/api/wearables/ingest`

**Wearable SDK (`wearableSDK.ts`):**
- Offline caching of unsynced vitals in AsyncStorage (`@cvital_offline`)
- Retry/sync queued vitals on reconnect
- Vitals data normalization

**Disabled (for build stability):**
- `appleHealthService.ts` and `googleFitService.ts` stub out and return null — actual native module calls go through WearableSDK

---

### 4.5 Wellness Programs

**What exists:**
- Programs List with header search + category filter tabs (from API)
- Recommended Programs carousel (4 always-on demo programs):
  - Guided Meditation (Mindfulness, 4 weeks, Beginner)
  - Pranayam Breathing (Breathing, 3 weeks, Beginner)
  - Morning Exercise (Fitness, 6 weeks, Intermediate)
  - Yoga for Health (Yoga, 8 weeks, All Levels)
- API-fetched programs with plan-tier locking (locked programs show an upgrade badge)
- Program Details: description, difficulty, duration, sessions list, YouTube video player, enroll CTA
- My Programs: enrolled programs, score-based empty-state recommendations, navigation to program days
- Program Day View: daily session list with Completed / Start states
- Session Player: YouTube iframe with playback speed controls (0.75×, 1×, 1.25×, 1.5×)
- Enroll endpoint: `/api/programs/:id/enroll`

---

### 4.6 Shop & E-Commerce

**What exists:**
- Product catalog from `/api/shop/products` with search and category filter
- Health benefit tags on each product card mapped by category:
  - Wearables → "❤️ Supports Heart Health"
  - Test Kits → "🔬 Know Your Risk Profile"
  - Supplements → "💊 Supports Metabolic Health"
  - Default → "🛡️ Supports Wellness"
- Product Detail: images, description, add to cart with haptic feedback
- Cart: item list, quantity adjustment, remove, total amount, checkout CTA
- Checkout: address form (name, phone, address, city, PIN, state), Razorpay order creation (`/api/shop/create-order`) and payment verification (`/api/shop/verify-payment`)
- Order Success screen with order ID
- Order History: past orders from `/api/shop/orders/my`
- Cart persisted in AsyncStorage (`shopping_cart`)
- Cart badge count on tab icon

---

### 4.7 Subscription Tiers

**What exists:**
- Plan comparison screen: Free / Silver (₹499/mo, ₹4999/yr) / Gold (₹999/mo, ₹9999/yr) / Platinum (₹2499/mo, ₹24999/yr)
- Monthly / Annual toggle
- Razorpay subscription creation (`/api/subscriptions/create`) and verification (`/api/subscriptions/verify`)
- Corporate plan support: users with `customerType === 'corporate'` see a corporate plan card and lock-out message on the subscription screen
- `currentPlan` from AuthContext is used across the app for access control
- Soft locks currently implemented:
  - Assessment history score trend chart: locked for Free/Silver users → upgrade to Gold prompt
  - "View Assessment History" button on WellnessScoreScreen: locked for Free → Gold upgrade CTA
- Plan badge colors consistent across app (Free grey / Silver blue / Gold amber / Platinum purple)

---

### 4.8 VIDA AI Chatbot

**What exists:**
- Floating FAB on all tabs, always accessible
- First-launch tooltip (persisted via `pv_vida_intro_shown` in AsyncStorage): "Hi! I'm VIDA, your AI health assistant. Tap me!" — auto-dismisses after 5 s
- Full-screen chat modal with message history
- Sends to `/api/ai/chat` with message + conversation history (multi-turn context)
- 4 quick-reply suggestions: "My health score", "Best program for my condition?", "How to improve my BP?", "How to connect my device?"
- Error handling with user-friendly fallback message
- Loading indicator per message

---

### 4.9 Notifications

**What exists:**
- Notifications screen (bell icon from dashboard header)
- Score-contextual notification cards built dynamically:
  - Score 0 → complete assessment action card
  - Score < 40 → At Risk warning
  - Score 40–59 → Fair improvement tip
  - Score 60–79 → Good, push toward Excellent
  - Score 80+ → Excellent health confirmation
  - Always shown: Connect wearable, Browse programs, Re-assess quarterly reminder
- Each notification can have an action button that navigates to relevant screen

**Note:** These are app-generated UI notifications only — no push notification system (FCM/APNs) is wired up yet.

---

### 4.10 Profile & Account Management

**What exists:**
- User Profile screen (tab): subscription plan card (gradient by tier), corporate vs individual plan display, validity/billing term, navigation to Edit Profile, Devices, Activity, Orders, Subscription, Contact Us, Terms, Privacy, Sign Out
- Profile Details: avatar with initials fallback, "Tap photo to change" with camera badge (UI present, actual upload "Coming Soon"), editable fields for all personal info + body metrics + location
- Activity screen: step count, calories, distance, active minutes with today/weekly tabs and trend visualization
- All Vitals screen: detailed vitals with time-range tabs (Today / Week / Month / 3M / Year), HR, SpO₂, BP, glucose
- Contact Us form: subject + message, submits to support
- Sign out: clears token and user state, returns to auth stack

---

### 4.11 Legal & Consent

**What exists:**
- Terms & Conditions full text screen
- Privacy Policy landing page with categories
- Privacy Overview with section list
- Privacy Detail with data collection, usage, partners, security sections
- Consent screen (mandatory gate before app access): user must tap "I Consent" before proceeding
- Consent state stored in secure storage, checked on every boot

---

## 5. Known Gaps & Incomplete Items

| Priority | Issue | File | Detail |
|----------|-------|------|--------|
| P0 | OTP verification is mocked | `auth/OtpVerificationScreen.tsx:19` | Uses `setTimeout(1s)` + `mock_token`. Remove screen until backend OTP is live, or wire real endpoint. |
| P1 | No push notifications | — | No FCM/APNs integration. Notifications screen is UI-only; users get no background alerts. |
| P1 | No streak / check-in loop | — | No daily engagement mechanic. App has no reason to open it tomorrow beyond habits. |
| P1 | Profile photo upload "Coming Soon" | `profile/ProfileDetailsScreen.tsx:50` | UI exists, both Camera and Library options show "Coming Soon" alert. Needs expo-image-picker. |
| P2 | Share Report is text-only | `health/WellnessScoreScreen.tsx:15` | Uses native `Share.share()` with plain text. No PDF generation. |
| P2 | Shop has no personalized dashboard surface | `HealthDashboardScreen.tsx` | No score-linked product recommendations on the main dashboard. |
| P2 | Programs empty state not score-aware | `programs/ProgramsListScreen.tsx:251` | Generic "No programs available" — should say "Based on your score of X, start with Y." |
| P2 | Subscription soft locks incomplete | — | Share Report and individual program screens have no paywall friction. |
| P2 | Google Fit / Apple Health services disabled | `api/appleHealthService.ts`, `api/googleFitService.ts` | Stubs returning null for build stability. Actual native read goes through WearableSDK only. |
| P3 | Programs category filter doesn't apply to Recommended carousel | `programs/ProgramsListScreen.tsx` | Selecting "Breathing" hides API programs but recommended carousel still shows all 4. |
| P3 | No re-assessment reminder scheduling | — | No in-app scheduled reminder or push to re-assess in 3 months. |
| P3 | No dark mode | — | App uses light-mode hardcoded colors only. |

---

## 6. New Features to Build

### 6.1 Push Notifications (High Priority)
- Integrate **Expo Notifications** (`expo-notifications`) with FCM (Android) and APNs (iOS)
- Backend stores push token per device
- Trigger scenarios:
  - Daily vitals reminder ("Time to log your readings")
  - Re-assessment reminder (3-month interval)
  - Abnormal wearable reading detected ("Your SpO₂ dropped to 88%")
  - Subscription renewal reminder
  - New program unlocked for your tier

### 6.2 Daily Check-In / Streak System
- 1-question daily check-in card on the dashboard ("How do you feel today?" 1–5 scale)
- Streak counter persisted in backend, displayed as a badge on the home tab
- Streak milestone celebrations (7-day, 30-day, 90-day) with shareable cards
- Linked to a small daily reminder push notification

### 6.3 PDF Health Report Generation
- Replace text-only share with a proper PDF:
  - Use `react-native-html-to-pdf` or a backend endpoint that renders an HTML report to PDF
  - Report includes: CVITAL score gauge, ASCVD risk, vital readings, assessment date, score bands, next steps, PreventVital branding
- "Share with Doctor" button generates and shares the PDF via native share sheet
- This is also a natural upgrade moment — gate full PDF to Gold+

### 6.4 Telemedicine / Doctor Consultation
- "Book a Consultation" CTA on the WellnessScoreScreen for At Risk and Fair users
- Calendar-based slot booking (integration: Calendly API, or custom backend slot system)
- In-app video call (WebRTC or Zoom SDK)
- Post-consultation notes stored in the user's health record
- Free-tier: no consultations; Silver: 1/mo; Gold: 3/mo; Platinum: unlimited

### 6.5 Family Plan / Multi-Profile
- Platinum tier allows up to 4 profiles under one account
- Switcher in the profile tab to toggle between family members
- Each member has their own CVITAL score, assessment history, and programs
- Parent/guardian can view children's scores

### 6.6 Medication & Vitals Manual Entry
- Daily manual log: BP, glucose, weight, medications taken (yes/no)
- Trend lines on AllVitals screen populated by both wearable + manual entries
- Medication adherence tracker (set medication schedule, get daily reminder)
- This eliminates the need for a wearable to have meaningful daily data

### 6.7 Health Coach / Expert Review (Premium Feature)
- Platinum users get access to a certified health coach
- Async messaging thread (similar to chat but with real coach response)
- Coach reviews CVITAL score + assessment data and sends personalized plan
- This is a high-LTV feature differentiating Platinum from Gold

### 6.8 Corporate Dashboard (B2B Admin)
- Web/mobile admin panel for HR teams managing corporate subscriptions
- Aggregate CVITAL score distribution across employees (anonymized)
- Departmental breakdowns, engagement metrics, high-risk cohort alerts
- Bulk employee invite/onboarding, CSV export

### 6.9 Wearable Data Deep Dive
- Add more granular metrics from Apple Health / Google Fit:
  - HRV (Heart Rate Variability) — key for stress
  - VO₂ Max — key for cardio fitness
  - Resting HR trend
  - Sleep stages (deep, REM, light)
  - Blood glucose (if available on device)
- Display these on AllVitals with historical charts

### 6.10 ASCVD Risk Calculator Explainer
- Standalone screen or bottom sheet that shows the ASCVD formula inputs
- Shows "If you reduce LDL by 20 mg/dL, your risk drops from 8.2% → 5.1%"
- Makes the score actionable and educational — reduces churn from confusion

### 6.11 Community / Social Features
- Leaderboard within corporate accounts (opt-in)
- Achievement badges: "Excellent CVITAL for 3 months straight", "Connected wearable for 30 days"
- Public program ratings and user reviews
- These are low-cost high-retention mechanics

### 6.12 Offline-First Architecture
- Currently: offline vitals caching exists in WearableSDK but most screens fail if backend is unreachable
- Goal: Cache assessment data, programs list, and dashboard score locally
- Use AsyncStorage as a read-through cache with TTL
- Allow users to browse programs and review their score without connectivity

---

## 7. Existing Functionality Improvements

### 7.1 OTP Flow (P0)
- **Current:** Mocked with `setTimeout(1000)` + `mock_token`
- **Fix Option A:** Remove OtpVerificationScreen from the navigation stack entirely until backend SMS gateway is live (Twilio / MSG91)
- **Fix Option B:** Wire up real OTP endpoint; screen is already complete UI-wise

### 7.2 Programs — Personalized Recommendations
- **Current:** "Recommended For You" carousel shows the same 4 programs regardless of score
- **Improve:** Pass `cvitalScore` to the section header and surface the most relevant program based on score band. Score < 40 → Cardiac Rehab first; Score 40–59 → Breathing + BP; Score 60–79 → Fitness + Yoga; Score 80+ → Maintenance programs
- **Also:** Apply category filter to the recommended carousel (currently only filters the API programs section)

### 7.3 Programs Empty State
- **Current:** "No programs available — Check back soon"
- **Improve:** "Based on your CVITAL score of [X], we recommend starting with [Program Name]" — pull score from AuthContext, link to the specific recommended program

### 7.4 Profile Photo Upload
- **Current:** Camera badge + "Tap photo to change" UI exists; both options say "Coming Soon"
- **Fix:** Add `expo-image-picker`, on pick → upload to backend (`/api/users/uploadPhoto`) or directly to cloud storage, update user profile object in AuthContext

### 7.5 Assessment Results — More Context
- **Current:** Shows raw CVITAL score, ASCVD risk, vascular age
- **Improve:** Add peer comparison ("Better than 68% of 45-year-old males in India"), add a "What changed since last time?" diff view if previous assessment exists

### 7.6 Subscription Screen — In-Context Paywalls
- **Current:** Subscription screen lists features abstractly; only 2 places have soft locks
- **Improve:** When a locked feature is tapped in context, show a bottom sheet: "Share Report with Doctor is a Gold feature — unlock for ₹999/mo" with an upgrade CTA. Currently missing for: PDF export, advanced program sessions, VIDA conversation history, HRV metrics

### 7.7 Wearable Connection UX
- **Current:** Connection happens but there's no persistent connection state indicator across tabs
- **Improve:** Show a green "Connected" or red "Disconnected" dot on the Devices tab icon. Add last sync badge in the vitals section header.

### 7.8 All Vitals Screen — Chart Improvements
- **Current:** Tabs (Today / Week / Month / 3M / Year) exist but vitals data may be sparse
- **Improve:** Show a "No readings in this period" state clearly; add interpolation for sparse data; add a date-range picker; export chart data to CSV

### 7.9 Dashboard Session Cards — Real Programs
- **Current:** Dashboard "Prescribed Modules" section uses hardcoded YouTube IDs
- **Improve:** Pull from enrolled programs API; show the next incomplete session for each enrolled program rather than time-of-day static content

### 7.10 CardioAssessment — Progress Persistence UX
- **Current:** Draft saves silently on each step change; no visible auto-save indicator
- **Improve:** Show a brief "Draft saved" toast after each section; add a resume banner on the dashboard when a draft exists: "You're 4/9 through your assessment — resume now"

---

## 8. Security Improvements

### 8.1 OTP / Authentication
- **Issue:** OTP screen is mocked — fake security gate is worse than no gate (users trust it)
- **Fix:** Implement real OTP via backend SMS gateway (MSG91, Twilio) before any production traffic
- **Add:** Rate limiting on login attempts in the client (exponential backoff after 3 failures, lockout UI)
- **Add:** "Log out all devices" button in profile settings
- **Add:** Session list with device name, IP, last active (useful for corporate users)

### 8.2 Token Management
- **Issue:** JWT stored in `expo-secure-store` (good) but there is no refresh token mechanism — if the JWT expires, the user is silently stuck with failed API calls
- **Fix:** Implement refresh token flow: store both `accessToken` (short TTL, 15 min) and `refreshToken` (long TTL, 30 days). Add a 401 response interceptor in `client.ts` that auto-refreshes before retrying the failed request
- **Fix:** Clear token and force re-auth on 401 if refresh also fails

### 8.3 API Request Security
- **Issue:** No request signing or HMAC. Razorpay webhook signatures should be verified server-side (likely already done), but make sure order IDs aren't guessable client-side
- **Add:** Certificate pinning for the API base URL using `@react-native-ssl-public-key-pinning` to prevent MITM attacks on the health data channel
- **Add:** Request timeout is set to 60s — consider reducing to 15s for most endpoints and 30s only for assessment score calculation

### 8.4 Health Data Privacy
- **Issue:** Health data (assessment form data, vitals) is sent plaintext over HTTPS — but locally there is no additional encryption layer
- **Improve:** Use expo-secure-store for any locally cached health data (currently AsyncStorage is used for draft assessments — AsyncStorage is unencrypted on Android)
- **Add:** Auto-wipe locally cached health data (draft assessments, vitals cache) after 7 days
- **Add:** Biometric lock option (FaceID / Fingerprint) to open the app — use `expo-local-authentication`

### 8.5 Sensitive Data in Logs
- **Issue:** `console.error` and `console.log` calls throughout the codebase may leak tokens, user data, or API responses in production builds
- **Fix:** Use a structured logger that strips PII fields and is disabled in production. Consider `react-native-logs` or a simple wrapper that no-ops in `__DEV__ === false`

### 8.6 Input Validation
- **Issue:** Most form fields do only basic validation (name required, email format). Clinical fields (BP, cholesterol) have no range guards client-side — a user could submit 999 as systolic BP
- **Fix:** Add clinical range validators to CardioAssessmentScreen fields:
  - Systolic BP: 50–300 mmHg
  - Diastolic BP: 30–200 mmHg
  - Total Cholesterol: 50–500 mg/dL
  - HbA1c: 2–20 %
  - Fasting Glucose: 40–600 mg/dL
  - Heart Rate: 20–250 bpm
  - SpO₂: 50–100 %

### 8.7 Razorpay Payment Security
- **Issue:** Payment verification (`/api/subscriptions/verify` and `/api/shop/verify-payment`) relies on the backend signature check — make sure the client never marks a payment as verified locally
- **Add:** Show a "Payment processing" loading state that can only be dismissed by a verified server response — not by a timeout
- **Add:** Handle Razorpay `payment.failed` webhook and surface a clear error to the user rather than leaving them on the loading screen

### 8.8 Consent & DPDP Compliance (India)
- **Add:** Data deletion request flow ("Delete my account and all health data") — required under India's Digital Personal Data Protection Act 2023
- **Add:** Explicit consent versioning — if privacy policy is updated, gate the app until user re-consents
- **Add:** Data portability: let users download their health data as JSON/CSV before deleting their account

---

## 9. Scalability Improvements

### 9.1 State Management — Move to Zustand
- **Issue:** Context API + re-renders: all consumers of AuthContext re-render on every state change. As the user object grows (health profile, subscription, devices, programs), this becomes expensive
- **Fix:** Migrate to **Zustand** for global state. Zustand uses selectors — components only re-render when the specific slice they subscribe to changes. Migration path: replace each Context with a Zustand store, keeping the same API surface

### 9.2 API Layer — React Query / TanStack Query
- **Issue:** Every screen that fetches data manages its own `loading`, `error`, and `data` state with `useEffect`. This means:
  - No request deduplication (same endpoint called multiple times on mount)
  - No caching (data re-fetched every screen focus)
  - No background refresh
  - No retry on network failure
- **Fix:** Wrap all API calls with **TanStack Query** (`@tanstack/react-query`). Benefits:
  - Automatic caching with TTL
  - Background re-validation on focus
  - Deduplicated in-flight requests
  - Optimistic updates for cart and enrollment
  - Built-in retry logic

### 9.3 Code Splitting & Lazy Loading
- **Issue:** All screens are eagerly imported in `AppNavigator.tsx` — this inflates the initial JS bundle
- **Fix:** Use `React.lazy()` + `Suspense` for non-critical screens (Shop, Legal, Activity History). Navigation stacks with deep-link targets need to stay eagerly loaded

### 9.4 Image Optimization
- **Issue:** `expo-image` is used for products but Unsplash URLs in the dashboard session cards are loaded at full resolution
- **Fix:** Append `?w=400&q=70&fm=webp` to all Unsplash URLs. For product images, serve WebP from the backend CDN with width parameters matching the 2-column layout

### 9.5 API Pagination
- **Issue:** Programs list fetches `?limit=50` in one call. Orders, assessment history, notifications all fetch all records
- **Fix:** Implement cursor-based pagination on all list endpoints. Use `FlatList`'s `onEndReached` + `ListFooterComponent` loading spinner for infinite scroll

### 9.6 Offline-First for Dashboard
- **Issue:** If the backend is unreachable (Cloud Run cold start or network dropout), the dashboard shows a blank skeleton indefinitely
- **Fix:** Cache last known dashboard state in AsyncStorage. On load, immediately render the cached data, then background-refresh and update. Key: `@pv_dashboard_cache` with TTL of 15 minutes

### 9.7 Background Vitals Sync
- **Issue:** Wearable vitals only sync when the user opens the Devices or Wearable Dashboard screen
- **Fix:** Use `expo-background-fetch` + `expo-task-manager` to schedule a background task that syncs Apple Health / Google Fit data every 30 minutes even when the app is backgrounded. This keeps the dashboard fresh for users who open the app infrequently

### 9.8 Reduce AsyncStorage Footprint
- **Issue:** Shopping cart, draft assessment, VIDA intro flag, offline vitals cache, all written to AsyncStorage individually
- **Fix:** Namespace all keys (`@pv_*`) and create a single storage utility with TTL support. Periodically prune stale keys on app boot (anything older than configured TTL)

### 9.9 Navigation Performance
- **Issue:** Bottom tabs use `HealthDashboardScreen` as the Home tab — this screen fetches vitals AND wearable data on every `useFocusEffect`. Switching tabs and coming back causes a full reload
- **Fix:** Add a `staleTime` check: only re-fetch if the last fetch was more than 2 minutes ago. Use `useRef` to track `lastFetchedAt` and guard the `loadData()` call

### 9.10 Error Boundary
- **Issue:** No React error boundaries — a crash in one screen propagates to a white screen across the whole app
- **Fix:** Wrap each tab's root with an `ErrorBoundary` component that shows a "Something went wrong — tap to reload this section" fallback. This keeps the rest of the app functional

### 9.11 TypeScript — Strict Mode
- **Issue:** Many props typed as `any` throughout (navigation props, API responses, form data). This makes refactoring risky
- **Fix:** Enable `strict: true` in `tsconfig.json`. Define proper types for:
  - API response shapes (`AuthResponse`, `VitalsData`, `AssessmentResult`, `Program`, `Product`)
  - Navigation param list (typed `useNavigation<NavigationProp<RootStackParamList>>()`)
  - Form data shapes in CardioAssessmentScreen

### 9.12 Backend Cold Start Mitigation
- **Issue:** The app already pings `/api/public/ping` on LoginScreen mount to pre-warm the Cloud Run instance. But users who open directly to a tab (deep link) won't trigger this
- **Fix:** Move the pre-warm ping to the AppNavigator / AuthProvider boot sequence so it fires regardless of entry point. Also consider migrating the most latency-sensitive endpoints (vitals, assessment score) to Cloud Run minimum instances = 1 to eliminate cold starts for paying users

---

## 10. Screen Inventory

| Screen | Path | Route Name | Tab |
|--------|------|------------|-----|
| WelcomeScreen | `auth/WelcomeScreen` | Welcome | Auth |
| LoginScreen | `auth/LoginScreen` | Login | Auth |
| SignUpScreen | `auth/SignUpScreen` | SignUp | Auth |
| OtpVerificationScreen | `auth/OtpVerificationScreen` | OtpVerification | Auth |
| ProfileSetupScreen | `auth/ProfileSetupScreen` | ProfileSetup | Auth |
| UserProfileScreen | `auth/UserProfileScreen` | UserProfile | Auth |
| ConsentScreen | `health/ConsentScreen` | Consent | Consent |
| HealthDashboardScreen | `HealthDashboardScreen` | Home | Home Tab |
| WellnessScoreScreen | `health/WellnessScoreScreen` | WellnessScore | App |
| WearableDashboardScreen | `health/WearableDashboardScreen` | WearableDashboard | App |
| AllVitalsScreen | `health/AllVitalsScreen` | AllVitals | App |
| AssessmentHistoryScreen | `health/AssessmentHistoryScreen` | AssessmentHistory | App |
| CardioAssessmentScreen | `onboarding/CardioAssessmentScreen` | CardioAssessment | App |
| AssessmentResultsScreen | `onboarding/AssessmentResultsScreen` | AssessmentResults | App |
| PersonalInformationScreen | `onboarding/PersonalInformationScreen` | PersonalInformation | Onboarding |
| HealthConditionsScreen | `onboarding/HealthConditionsScreen` | HealthConditions | Onboarding |
| HealthGoalsScreen | `onboarding/HealthGoalsScreen` | HealthGoals | Onboarding |
| ConnectDevicesScreen | `onboarding/ConnectDevicesScreen` | ConnectDevices | Onboarding |
| ProgramsListScreen | `programs/ProgramsListScreen` | Programs | Programs Tab |
| MyProgramsScreen | `programs/MyProgramsScreen` | MyPrograms | App |
| ProgramDetailsScreen | `programs/ProgramDetailsScreen` | ProgramDetails | App |
| ProgramDayViewScreen | `programs/ProgramDayViewScreen` | ProgramDayView | App |
| SessionPlayerScreen | `programs/SessionPlayerScreen` | SessionPlayer | App |
| ShopScreen | `shop/ShopScreen` | Shop | Shop Tab |
| ProductDetailScreen | `shop/ProductDetailScreen` | ProductDetail | App |
| CartScreen | `shop/CartScreen` | Cart | App |
| CheckoutScreen | `shop/CheckoutScreen` | Checkout | App |
| OrderSuccessScreen | `shop/OrderSuccessScreen` | OrderSuccess | App |
| OrderHistoryScreen | `shop/OrderHistoryScreen` | OrderHistory | App |
| SubscriptionScreen | `subscription/SubscriptionScreen` | Subscription | App |
| ProfileDetailsScreen | `profile/ProfileDetailsScreen` | ProfileDetails | App |
| DevicesScreen | `devices/DevicesScreen` | Devices | Devices Tab |
| ActivityScreen | `activity/ActivityScreen` | Activity | App |
| NotificationsScreen | `NotificationsScreen` | Notifications | App |
| ContactUsScreen | `ContactUsScreen` | ContactUs | App |
| TermsAndConditionsScreen | `legal/TermsAndConditionsScreen` | TermsAndConditions | App |
| PrivacyPolicyLandingScreen | `legal/PrivacyPolicyLandingScreen` | PrivacyPolicyLanding | App |
| PrivacyOverviewScreen | `legal/PrivacyOverviewScreen` | PrivacyOverview | App |
| PrivacyDetailScreen | `legal/PrivacyDetailScreen` | PrivacyDetail | App |

---

## 11. API Inventory

| Method | Endpoint | Used In |
|--------|---------|---------|
| GET | `/api/public/ping` | LoginScreen (pre-warm) |
| POST | `/api/auth/login` | authApi.login |
| POST | `/api/auth/signup` | authApi.signup |
| GET | `/api/users/me` | authApi.fetchMe |
| PUT | `/api/users/profile/onboarding` | authApi.updateOnboarding |
| PATCH | `/api/users/updateMe` | ProfileDetailsScreen |
| POST | `/api/vitals/calculate-score` | CardioAssessmentScreen |
| GET | `/api/vitals/latest` | vitalsSync.getVitals |
| GET | `/api/vitals/assessments` | vitalsSync.getAssessmentHistory |
| POST | `/api/wearable/sync/applehealth` | vitalsSync.syncVitals |
| GET | `/api/wearables/history` | WearableDashboardScreen |
| GET | `/api/wearables/latest` | HealthDashboardScreen |
| GET | `/api/wearables/oauth/googlefit/login` | DevicesScreen, WearableDashboardScreen |
| POST | `/api/wearables/sync/googlefit` | wearableSDK.syncGoogleFit |
| POST | `/api/wearables/ingest` | wearableSDK.syncWithBackend |
| POST | `/api/subscriptions/create` | subscriptionApi.createSubscription |
| POST | `/api/subscriptions/verify` | subscriptionApi.verifySubscription |
| GET | `/api/users/my-subscription` | subscriptionApi.fetchMySubscription |
| GET | `/api/programs?limit=50` | ProgramsListScreen |
| POST | `/api/programs/:id/enroll` | ProgramsListScreen |
| GET | `/api/shop/products` | shopApi.getProducts |
| POST | `/api/shop/create-order` | shopApi.createOrder |
| POST | `/api/shop/verify-payment` | shopApi.verifyPayment |
| GET | `/api/shop/orders/my` | shopApi.getMyOrders |
| POST | `/api/ai/chat` | VIDAChatbot |

---

*Document generated: May 2026. This reflects the codebase as of the current commit on the master branch.*

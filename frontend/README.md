# FitFlow — Premium Fitness Tracker (Expo / React Native)

A premium dark, orange-glow fitness app: live step tracking, hydration, sleep, workouts, habits, body measurements, advanced analytics, 7 themes, and 4 languages.

> **Platform note:** This is an **Expo (React Native + TypeScript)** project, not a native Kotlin/Android Studio project. It ships to the Google Play Store as an **Android App Bundle (AAB)** via the Emergent **Publish** button. There is no Gradle/Kotlin source to open in Android Studio.

## Stack
- Expo SDK 54, Expo Router (file-based navigation)
- React Native 0.81, TypeScript
- `react-native-svg` (rings, charts, water fill)
- `expo-sensors` (Pedometer — real steps on device)
- `expo-notifications` (reminders)
- AsyncStorage (all local persistence — no backend)

## Features
- **Onboarding** + **Language selection** (English, ગુજરાતી, Português-BR, हिन्दी) + **Permissions**
- **Home**: glowing circular step ring, 4 stat cards, weekly line chart, daily goals, reset
- **Steps**: advanced analytics — metric switcher (Steps/Distance/Calories/Hydration/Habits), Daily/Weekly/Monthly tabs, tap-to-read bars, averages, best day, trend %
- **Workout** timer (Walking/Running/Cycling/Custom) with Start/Pause/Resume/Stop + history
- **Habits** checklist with streaks
- **Body** measurements (gender, birth year, weight, height, step length)
- **Hydration** with animated water fill + quick add; **Sleep** manual logging
- **Settings**: General(language), Personal, Activity, Hydration, Sleep, Notifications, Appearance(7 themes), Follow Us(Instagram/X/Facebook), App(Rate/Widget), Data, About(Privacy/Terms/Contact)
- **7 instant themes**: Orange (default), Blue, Red, Green, Purple, Pink, AMOLED Black

## Configuration
- **Ad IDs & links:** `src/ads/config.ts` — replace `*_prod` AdMob unit IDs and `APP_LINKS.playStore` before release. `USE_TEST_ADS = true` uses Google's official test IDs.
- **Languages:** `src/i18n/index.tsx`
- **Themes:** `src/theme/index.tsx`

## AdMob (Banner + Native + Interstitial) — enabling real ads
`react-native-google-mobile-ads` is a **native module**: it does NOT run in Expo Go / web preview. The app currently renders **stub components** (`AdBanner`, `NativeAdCard`) and an interstitial **frequency manager** (`src/ads/manager.ts`) with counters. To go live in a build:

1. `yarn expo install react-native-google-mobile-ads`
2. Add the config plugin to `app.json` plugins:
   ```json
   ["react-native-google-mobile-ads", {
     "androidAppId": "ca-app-pub-XXXX~XXXX",
     "iosAppId": "ca-app-pub-XXXX~XXXX"
   }]
   ```
3. Replace the stub bodies in `src/components/ui.tsx` (`AdBanner`→`BannerAd`, `NativeAdCard`→`NativeAd`/`NativeAdView`) and wire `maybeShowInterstitial` in `src/ads/manager.ts` to `InterstitialAd` — using `AD_UNITS` from `src/ads/config.ts`.
4. Build via Emergent **Publish** (generates the AAB).

**Interstitial policy** (`src/ads/config.ts` → `INTERSTITIAL_POLICY`): shown only after 3+ app-open sessions OR 3+ feature interactions, min 90s cooldown, max 2 per session. Never during onboarding, permissions, goal saving, hydration entry, or body setup.

## Home-screen widget
Android home-screen widgets require a native widget module and only work in a production build (not Expo Go). The Settings toggle (`Home Screen Widget`) persists the user's preference (`settings.widgetEnabled`); wire it to a native widget provider (e.g. `expo-apple-targets` / a custom Android AppWidgetProvider) in your dev build to render live Steps / Goal / Progress.

## Run
```bash
cd frontend
yarn
yarn start      # Expo Go for JS features; use a dev build for sensors/ads/widget
```

## Publish (Play Store)
Use the Emergent **Publish** button (top-right) → generates the Android AAB. Real pedometer, notifications, AdMob, and the widget only activate in the generated build.

# FitFlow – PRD & Change Log

## Original ask (imported APK source)
Redesign Home screen + add features, without breaking existing FitFlow functionality.

## Architecture
- Expo SDK 54, expo-router, React Native. Client-only (AsyncStorage store in src/store). FastAPI/Mongo backend present but unused by these features.

## Implemented
- Home screen premium redesign (dark/light card styles), theme-aware accents, animated step ring, streak glow, live "+500 Steps" demo FAB. (dates: this session series)
- Settings "Home Card Style" Dark/Light toggle; theme color now reflects on Home.
- App icon confirmed blue; Android adaptive-icon backgroundColor set to #2E4BA0.
- **Android Home-Screen Widget** (react-native-android-widget):
  - Widget name `StepsWidget`, shows steps / goal / % + progress bar, tap opens app.
  - Files: src/widgets/StepsWidget.tsx, src/widgets/widget-data.tsx, src/widgets/widget-task-handler.tsx, index.js (custom entry registering task handler), app.json plugin config, assets/images/widget-preview.png.
- **Background Step Tracking** (expo-android-pedometer):
  - Native foreground service + hardware TYPE_STEP_COUNTER; continues minimized/locked/terminated; boot receiver handles reboots.
  - Files: src/hooks/use-step-tracking.ts (mounted via StepTrackingBridge in app/_layout.tsx), reconcile on launch + AppState active, feeds store + widget.
  - Permissions rewritten (app/permissions.tsx): activity + notification with granted/denied/blocked + Open Settings; starts foreground service on grant.
  - home.tsx foreground expo-sensors subscription now skipped on Android (avoids double counting).

## Native build required
Widget + background service ONLY work in a real EAS/APK build (not web preview / Expo Go). Verified in preview: no regressions (iteration_2.json).

## Backlog / not done
- Real AdMob integration (currently stubs in src/ads).
- Functional notifications/reminders (toggles are still no-ops).
- Health Connect sync (optional).

# FitFlow – Home Screen Redesign

## What Changed
- Redesigned `/app/frontend/app/(tabs)/home.tsx` from a dark glassmorphism layout to a premium light-card-on-dark-bg design matching the provided reference image #2.
- Redesigned `/app/frontend/app/(tabs)/_layout.tsx` bottom tab bar into a rounded white pill with an orange "active tab" glow (label only on the active tab).

## Kept 100% Intact
- All existing screens: onboarding, permissions, language, settings, steps, workout, habits, body, detail screens.
- Store / tracking logic (`src/store`), step counter (Pedometer), water/sleep/workout tracking, habits, goals.
- Ads (`AdBanner`, `NativeAdCard`, `initAdSession`, `maybeShowInterstitial`).
- Themes system (`src/theme`), i18n, navigation, permissions, `app.json` config (FitFlow name, motion permissions, etc.).
- Data flow is real: ring, weekly chart, hydration, sleep, workout, steps all bind to `useStore()`.

## New Home Screen Sections
1. Header – circle avatar, "Hi, Guest 👋 / Welcome back to FitFlow", dark **Day Streak** chip, notification bell (with dot), settings gear.
2. Main Step Ring Card (light off-white, orange glow) – Daily Goal label, editable goal, big ring with white track + orange progress gradient, centered `steps` count, shoe icon, orange "% Complete" pill, "Edit Goal" pill.
3. Four stat cards in ONE horizontal row – Calories Burned, Distance Walked, Hydration Tracker, Sleep Tracker (equal widths, orange wave decoration on stat cards without live progress, orange progress bar on the ones with).
4. Weekly Progress card – line chart with two series (This Week orange / Last Week grey), Mon–Sun labels, Y-axis 0/5K/10K/15K, "Weekly Avg" + % change vs last week, "Best Day" chip. Chart auto-updates from real step history.
5. Daily Goals card – 4 mini cards in one row (Water, Sleep, Workout, Steps) each with icon, label, `X / Y`, and orange progress bar. All live.
6. Ads and "Reset Today's Data" preserved below.

## Notes
- No web-only libs, uses `react-native-svg` for ring + charts.
- All interactive elements carry `testID`s (`home-screen`, `home-ring-card`, `home-edit-goal`, `stat-calories/distance/hydration/sleep`, `home-weekly-card`, `home-daily-goals-card`, `goal-water/sleep/workout/step`, `home-view-all`, `home-reset-button`, `home-streak-card`, `home-notifications-icon`, `home-settings-icon`, `tab-home/steps/workout/habits/body`).
- To generate the new APK, use the **Publish** button (top-right of Emergent).

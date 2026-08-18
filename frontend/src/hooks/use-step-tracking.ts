import { useEffect, useRef } from 'react';
import { Platform, AppState } from 'react-native';

import { useStore } from '@/src/store';
import { updateStepsWidget } from '@/src/widgets/widget-data';

/**
 * Android real background step tracking bridge.
 *
 * - Uses `expo-android-pedometer` (native foreground service + hardware
 *   TYPE_STEP_COUNTER sensor) which keeps counting while the app is minimized,
 *   the screen is locked, or the app is terminated, and survives reboots via
 *   the module's BOOT_COMPLETED receiver.
 * - On launch and whenever the app returns to foreground it RECONCILES the
 *   device's true daily total via `getStepsCountAsync()` so no steps are lost
 *   while the app was closed (also avoids double counting — native total is the
 *   single source of truth on Android).
 * - Mirrors every change into the FitFlow store and the home-screen widget.
 *
 * On web / iOS this is a safe no-op (the module + widget are Android-only), so
 * all existing behaviour (incl. the manual demo controls) is preserved.
 */
export function useStepTracking() {
  const { setSteps, state } = useStore();
  const goalRef = useRef(state.settings.stepGoal);
  goalRef.current = state.settings.stepGoal;

  const permsRequested = state.settings.permsRequested;

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    const AndroidPedometer = (() => {
      try {
        return require('expo-android-pedometer');
      } catch {
        return null;
      }
    })();
    if (!AndroidPedometer) return;

    const sync = async () => {
      try {
        const steps = await AndroidPedometer.getStepsCountAsync();
        if (mounted && typeof steps === 'number' && !Number.isNaN(steps)) {
          setSteps(steps);
          updateStepsWidget(steps, goalRef.current);
        }
      } catch {}
    };

    (async () => {
      try {
        await AndroidPedometer.initialize();

        // Only start the foreground service if the user already granted the
        // activity permission (requested on the permissions screen).
        try {
          const perm = await AndroidPedometer.getActivityPermissionStatus();
          if (perm?.granted) {
            await AndroidPedometer.setupBackgroundUpdates({
              title: 'FitFlow',
              contentTemplate: "You've walked %d steps today",
              style: 'bigText',
              iconResourceName: 'ic_launcher',
            });
          }
        } catch {}

        await sync();

        unsubscribe = AndroidPedometer.subscribeToChange((event: { steps: number }) => {
          if (!mounted) return;
          if (typeof event?.steps === 'number' && !Number.isNaN(event.steps)) {
            setSteps(event.steps);
            updateStepsWidget(event.steps, goalRef.current);
          }
        });
      } catch {}
    })();

    const appStateSub = AppState.addEventListener('change', (next) => {
      if (next === 'active') sync();
    });

    return () => {
      mounted = false;
      try { unsubscribe && unsubscribe(); } catch {}
      appStateSub.remove();
    };
    // Re-run when permission is granted so the service can start immediately.
  }, [permsRequested, setSteps]);
}

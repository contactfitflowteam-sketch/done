import { useEffect, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import { Pedometer } from 'expo-sensors';

import { useStore } from '@/src/store';
import { updateStepsWidget } from '@/src/widgets/widget-data';

export function useStepTracking() {
  const { setSteps, state } = useStore();
  const goalRef = useRef(state.settings.stepGoal);
  goalRef.current = state.settings.stepGoal;

  const permsRequested = state.settings.permsRequested;

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let mounted = true;
    let customUnsub: (() => void) | undefined;
    let expoSensorSub: { remove: () => void } | undefined;

    const AndroidPedometer = (() => {
      try {
        return require('expo-android-pedometer');
      } catch {
        return null;
      }
    })();

    const syncNativeSteps = async () => {
      if (AndroidPedometer) {
        try {
          const steps = await AndroidPedometer.getStepsCountAsync();
          if (mounted && typeof steps === 'number' && !Number.isNaN(steps) && steps > 0) {
            setSteps(steps);
            updateStepsWidget(steps, goalRef.current);
            return true;
          }
        } catch {}
      }
      return false;
    };

    (async () => {
      // 1. Check & Request Sensor Permission
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        if (isAvailable) {
          const perm = await Pedometer.requestPermissionsAsync();
          if (perm.granted) {
            // Live Step Counter listener (Phone move hone par real-time update)
            expoSensorSub = Pedometer.watchStepCount((result) => {
              if (!mounted) return;
              if (result && typeof result.steps === 'number') {
                setSteps((prev) => {
                  const updated = (typeof prev === 'number' ? prev : 0) + 1;
                  updateStepsWidget(updated, goalRef.current);
                  return updated;
                });
              }
            });
          }
        }
      } catch (e) {
        console.warn('Expo pedometer init err:', e);
      }

      // 2. Setup Background Hardware Sensor Service
      if (AndroidPedometer) {
        try {
          await AndroidPedometer.initialize();
          const perm = await AndroidPedometer.getActivityPermissionStatus();
          if (perm?.granted) {
            await AndroidPedometer.setupBackgroundUpdates({
              title: 'FitFlow',
              contentTemplate: "You've walked %d steps today",
              style: 'bigText',
              iconResourceName: 'ic_launcher',
            });
          }

          await syncNativeSteps();

          customUnsub = AndroidPedometer.subscribeToChange((event: { steps: number }) => {
            if (!mounted) return;
            if (typeof event?.steps === 'number' && !Number.isNaN(event.steps)) {
              setSteps(event.steps);
              updateStepsWidget(event.steps, goalRef.current);
            }
          });
        } catch {}
      }
    })();

    const appStateSub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        syncNativeSteps();
      }
    });

    return () => {
      mounted = false;
      try { customUnsub && customUnsub(); } catch {}
      try { expoSensorSub && expoSensorSub.remove(); } catch {}
      appStateSub.remove();
    };
  }, [permsRequested, setSteps]);
}

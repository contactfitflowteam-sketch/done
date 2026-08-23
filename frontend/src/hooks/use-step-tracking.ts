import { useEffect, useRef } from 'react';
import { Platform, AppState } from 'react-native';

import { useStore } from '@/src/store';
import { updateStepsWidget } from '@/src/widgets/widget-data';

export function useStepTracking() {
  const { setSteps, state } = useStore();
  const goalRef = useRef(state?.settings?.stepGoal ?? 15000);
  goalRef.current = state?.settings?.stepGoal ?? 15000;

  const permsRequested = state?.settings?.permsRequested;
  const langSelected = state?.settings?.langSelected;

  useEffect(() => {
    // Jab tak user language aur onboarding cross na kare, sensor na start karein
    if (Platform.OS !== 'android' || !langSelected) return;

    let mounted = true;
    let customUnsub: (() => void) | undefined;
    let expoSensorSub: { remove: () => void } | undefined;

    const startTracking = async () => {
      try {
        const { Pedometer } = require('expo-sensors');
        const isAvailable = await Pedometer.isAvailableAsync().catch(() => false);
        
        if (isAvailable && mounted) {
          const perm = await Pedometer.getPermissionsAsync().catch(() => null);
          if (perm?.granted) {
            expoSensorSub = Pedometer.watchStepCount((result: { steps: number }) => {
              if (!mounted) return;
              if (result && typeof result.steps === 'number') {
                setSteps((prev) => {
                  const current = typeof prev === 'number' ? prev : 0;
                  const updated = current + 1;
                  updateStepsWidget(updated, goalRef.current).catch(() => {});
                  return updated;
                });
              }
            });
          }
        }
      } catch (e) {
        console.warn('Sensor safe fallback triggered:', e);
      }

      try {
        const AndroidPedometer = require('expo-android-pedometer');
        if (AndroidPedometer && mounted) {
          await AndroidPedometer.initialize().catch(() => {});
          const steps = await AndroidPedometer.getStepsCountAsync().catch(() => null);
          
          if (mounted && typeof steps === 'number' && !Number.isNaN(steps) && steps > 0) {
            setSteps(steps);
            updateStepsWidget(steps, goalRef.current).catch(() => {});
          }

          customUnsub = AndroidPedometer.subscribeToChange((event: { steps: number }) => {
            if (!mounted) return;
            if (typeof event?.steps === 'number' && !Number.isNaN(event.steps)) {
              setSteps(event.steps);
              updateStepsWidget(event.steps, goalRef.current).catch(() => {});
            }
          });
        }
      } catch {}
    };

    // Safe delay to let UI mount smoothly
    const timer = setTimeout(() => {
      startTracking();
    }, 1000);

    const appStateSub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        startTracking();
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timer);
      try { customUnsub && customUnsub(); } catch {}
      try { expoSensorSub && expoSensorSub.remove(); } catch {}
      appStateSub.remove();
    };
  }, [permsRequested, langSelected, setSteps]);
}

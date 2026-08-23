import { useEffect, useRef } from 'react';
import { Platform, AppState } from 'react-native';
import { useStore } from '@/src/store';
import { updateStepsWidget } from '@/src/widgets/widget-data';

export function useStepTracking() {
  const { setSteps, state } = useStore();
  const goalRef = useRef(state?.settings?.stepGoal ?? 15000);
  goalRef.current = state?.settings?.stepGoal ?? 15000;

  const permsRequested = state?.settings?.permsRequested;

  useEffect(() => {
    if (Platform.OS !== 'android' || !permsRequested) return;

    let mounted = true;
    let customUnsub: (() => void) | undefined;
    let baselineSteps = -1;

    const startRealStepCounting = async () => {
      // 1. Android Hardware Step Counter Service
      try {
        const AndroidPedometer = require('expo-android-pedometer');
        if (AndroidPedometer) {
          await AndroidPedometer.initialize().catch(() => {});
          
          const rawSteps = await AndroidPedometer.getStepsCountAsync().catch(() => null);
          if (mounted && typeof rawSteps === 'number' && rawSteps >= 0) {
            setSteps(rawSteps);
            updateStepsWidget(rawSteps, goalRef.current).catch(() => {});
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

      // 2. Hardware Sensor Delta Listener (Real Motion Only)
      try {
        const { Pedometer } = require('expo-sensors');
        const isAvailable = await Pedometer.isAvailableAsync().catch(() => false);
        if (isAvailable && mounted) {
          Pedometer.watchStepCount((result: { steps: number }) => {
            if (!mounted) return;
            // result.steps sensor ka cumulative count hota hai, timer nahi
            if (result && typeof result.steps === 'number') {
              if (baselineSteps === -1) {
                baselineSteps = result.steps;
              }
              const delta = result.steps - baselineSteps;
              if (delta > 0) {
                setSteps((prev) => {
                  const current = typeof prev === 'number' ? prev : 0;
                  const updated = current + delta;
                  baselineSteps = result.steps;
                  updateStepsWidget(updated, goalRef.current).catch(() => {});
                  return updated;
                });
              }
            }
          });
        }
      } catch {}
    };

    startRealStepCounting();

    const appStateSub = AppState.addEventListener('change', (next) => {
      if (next === 'active') {
        startRealStepCounting();
      }
    });

    return () => {
      mounted = false;
      try { customUnsub && customUnsub(); } catch {}
      appStateSub.remove();
    };
  }, [permsRequested, setSteps]);
}

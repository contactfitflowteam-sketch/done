import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@fitflow.store';

export type WorkoutSession = { id: string; type: string; startTs: number; endTs: number; durationSec: number; distanceKm: number; calories: number; };
export type DayEntry = { date: string; steps: number; water: number; sleepMin: number; caloriesBurned: number; distanceKm: number; };
export type Profile = { name: string; gender: 'Male' | 'Female' | 'Other'; birthYear: number; weightKg: number; heightCm: number; stepLengthCm: number | 'auto'; };
export type Settings = { stepGoal: number; waterGoalMl: number; sleepGoalHr: number; glassSizeMl: number; distanceUnit: 'km' | 'mi'; weightUnit: 'kg' | 'lb'; heightUnit: 'cm' | 'ft'; notifSteps: boolean; notifWater: boolean; notifWorkout: boolean; notifStreak: boolean; onboarded: boolean; permsRequested: boolean; langSelected: boolean; widgetEnabled: boolean; homeAppearance: 'dark' | 'light'; };
export type HabitState = Record<string, string[]>;

export type AppState = {
  isLoading?: boolean;
  isHydrated?: boolean;
  profile: Profile;
  settings: Settings;
  days: Record<string, DayEntry>;
  workouts: WorkoutSession[];
  habits: HabitState;
};

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const DEFAULT_STATE: AppState = {
  isLoading: false,
  isHydrated: true,
  profile: { name: 'Guest', gender: 'Male', birthYear: 1995, weightKg: 70, heightCm: 175, stepLengthCm: 'auto' },
  settings: { stepGoal: 15000, waterGoalMl: 2500, sleepGoalHr: 8, glassSizeMl: 250, distanceUnit: 'km', weightUnit: 'kg', heightUnit: 'cm', notifSteps: true, notifWater: true, notifWorkout: true, notifStreak: true, onboarded: false, permsRequested: false, langSelected: false, widgetEnabled: false, homeAppearance: 'dark' },
  days: {},
  workouts: [],
  habits: {},
};

type StoreCtx = {
  state: AppState;
  today: () => DayEntry;
  update: (fn: (s: AppState) => AppState) => void;
  setSteps: (n: number | ((prev: number) => number)) => void;
  addWater: (ml: number) => void;
  setSleep: (min: number) => void;
  addCalories: (c: number) => void;
  addDistance: (km: number) => void;
  addWorkout: (w: WorkoutSession) => void;
  toggleHabit: (id: string) => void;
  resetToday: () => void;
  resetAll: () => void;
  saveProfile: (p: Partial<Profile>) => void;
  saveSettings: (s: Partial<Settings>) => void;
  getStreak: () => number;
};

const StoreContext = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({ ...DEFAULT_STATE, isLoading: true, isHydrated: false });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v) {
          try {
            const parsed = JSON.parse(v);
            setState({ ...DEFAULT_STATE, ...parsed, isLoading: false, isHydrated: true });
          } catch {
            setState({ ...DEFAULT_STATE, isLoading: false, isHydrated: true });
          }
        } else {
          setState({ ...DEFAULT_STATE, isLoading: false, isHydrated: true });
        }
      })
      .catch(() => {
        setState({ ...DEFAULT_STATE, isLoading: false, isHydrated: true });
      })
      .finally(() => {
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
    }
  }, [state, loaded]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  const ensureToday = (s: AppState): AppState => {
    const k = todayKey();
    if (s.days[k]) return s;
    return { ...s, days: { ...s.days, [k]: { date: k, steps: 0, water: 0, sleepMin: 0, caloriesBurned: 0, distanceKm: 0 } } };
  };

  const today = useCallback((): DayEntry => {
    const k = todayKey();
    return state.days[k] || { date: k, steps: 0, water: 0, sleepMin: 0, caloriesBurned: 0, distanceKm: 0 };
  }, [state]);

  const patchToday = (patch: Partial<DayEntry>) => {
    update((s) => {
      const s2 = ensureToday(s);
      const k = todayKey();
      return { ...s2, days: { ...s2.days, [k]: { ...s2.days[k], ...patch } } };
    });
  };

  const setSteps = (n: number | ((prev: number) => number)) => {
    update((s) => {
      const s2 = ensureToday(s);
      const k = todayKey();
      const currentEntry = s2.days[k] || { date: k, steps: 0, water: 0, sleepMin: 0, caloriesBurned: 0, distanceKm: 0 };
      const newSteps = typeof n === 'function' ? n(currentEntry.steps) : n;
      
      const stepLen = s.profile.stepLengthCm === 'auto' ? s.profile.heightCm * 0.415 : s.profile.stepLengthCm;
      const distanceKm = (newSteps * stepLen) / 100000;
      const calories = Math.round(newSteps * 0.04 * (s.profile.weightKg / 70));

      return {
        ...s2,
        days: {
          ...s2.days,
          [k]: {
            ...currentEntry,
            steps: newSteps,
            distanceKm: parseFloat(distanceKm.toFixed(2)),
            caloriesBurned: calories,
          },
        },
      };
    });
  };

  const addWater = (ml: number) => {
    const t = today();
    patchToday({ water: Math.max(0, t.water + ml) });
  };
  const setSleep = (min: number) => patchToday({ sleepMin: min });
  const addCalories = (c: number) => { const t = today(); patchToday({ caloriesBurned: t.caloriesBurned + c }); };
  const addDistance = (km: number) => { const t = today(); patchToday({ distanceKm: parseFloat((t.distanceKm + km).toFixed(2)) }); };
  const addWorkout = (w: WorkoutSession) => update((s) => ({ ...s, workouts: [w, ...s.workouts] }));
  const toggleHabit = (id: string) => {
    const k = todayKey();
    update((s) => {
      const arr = s.habits[id] || [];
      const has = arr.includes(k);
      return { ...s, habits: { ...s.habits, [id]: has ? arr.filter((d) => d !== k) : [...arr, k] } };
    });
  };
  const resetToday = () => {
    const k = todayKey();
    update((s) => ({ ...s, days: { ...s.days, [k]: { date: k, steps: 0, water: 0, sleepMin: 0, caloriesBurned: 0, distanceKm: 0 } } }));
  };
  const resetAll = () => setState((s) => ({ ...DEFAULT_STATE, settings: { ...DEFAULT_STATE.settings, onboarded: true, permsRequested: true, langSelected: true } }));
  const saveProfile = (p: Partial<Profile>) => update((s) => ({ ...s, profile: { ...s.profile, ...p } }));
  const saveSettings = (p: Partial<Settings>) => update((s) => ({ ...s, settings: { ...s.settings, ...p } }));

  const getStreak = useCallback(() => {
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const entry = state.days[k];
      if (entry && entry.steps >= state.settings.stepGoal * 0.5) streak += 1;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }, [state]);

  const value: StoreCtx = useMemo(() => ({
    state, today, update, setSteps, addWater, setSleep, addCalories, addDistance, addWorkout, toggleHabit, resetToday, resetAll, saveProfile, saveSettings, getStreak,
  }), [state]); // eslint-disable-line

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
};

export const dateKey = todayKey;

export function last7Days(days: Record<string, DayEntry>): DayEntry[] {
  const out: DayEntry[] = [];
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(d); dt.setDate(d.getDate() - i);
    const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    out.push(days[k] || { date: k, steps: 0, water: 0, sleepMin: 0, caloriesBurned: 0, distanceKm: 0 });
  }
  return out;
}

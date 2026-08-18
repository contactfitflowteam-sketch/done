import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

import { StepsWidget, StepsWidgetData } from './StepsWidget';

// Persisted snapshot the (headless) widget task handler reads when Android asks
// it to re-render the widget (WIDGET_ADDED / periodic WIDGET_UPDATE).
const WIDGET_KEY = '@fitflow.widget';
export const WIDGET_NAME = 'StepsWidget';

export async function saveWidgetData(data: StepsWidgetData): Promise<void> {
  try {
    await AsyncStorage.setItem(WIDGET_KEY, JSON.stringify(data));
  } catch {}
}

export async function loadWidgetData(): Promise<StepsWidgetData> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { steps: Number(parsed.steps) || 0, goal: Number(parsed.goal) || 15000 };
    }
  } catch {}
  return { steps: 0, goal: 15000 };
}

/**
 * Push a fresh render to every StepsWidget currently on the home screen and
 * persist the snapshot for future system-triggered updates.
 * No-op (safe) on web / iOS or when the native module is unavailable.
 */
export async function updateStepsWidget(steps: number, goal: number): Promise<void> {
  await saveWidgetData({ steps, goal });
  if (Platform.OS !== 'android') return;
  try {
    // Lazy require so web/iOS bundles never touch the native module.
    const { requestWidgetUpdate } = require('react-native-android-widget');
    await requestWidgetUpdate({
      widgetName: WIDGET_NAME,
      renderWidget: () => <StepsWidget steps={steps} goal={goal} />,
      widgetNotFound: () => {},
    });
  } catch {}
}

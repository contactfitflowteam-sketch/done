import React from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StepsWidget, StepsWidgetData } from './StepsWidget';

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

export async function updateStepsWidget(steps: number, goal: number): Promise<void> {
  await saveWidgetData({ steps, goal });
  if (Platform.OS !== 'android') return;
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    if (typeof requestWidgetUpdate === 'function') {
      await requestWidgetUpdate({
        widgetName: WIDGET_NAME,
        renderWidget: () => <StepsWidget steps={steps} goal={goal} />,
        widgetNotFound: () => {},
      });
    }
  } catch (e) {
    console.warn('[Widget] Update error:', e);
  }
}

export async function pinWidgetToHomeScreen(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const widgetLib = require('react-native-android-widget');
    // Dono function names check karega taaki version mismatch na ho
    const pinFunc = widgetLib.requestPinWidget || widgetLib.requestWidgetPin;

    if (typeof pinFunc === 'function') {
      const success = await pinFunc({
        widgetName: WIDGET_NAME,
        renderWidget: () => <StepsWidget steps={0} goal={15000} />,
      });
      return success;
    } else {
      Alert.alert(
        'Add Widget',
        'Long-press on your phone home screen, select "Widgets", and choose FitFlow Steps widget.'
      );
    }
  } catch (e) {
    console.warn('[Widget] Pin error:', e);
    Alert.alert(
      'Add Widget',
      'Please long-press your home screen and add the FitFlow widget manually.'
    );
  }
  return false;
}

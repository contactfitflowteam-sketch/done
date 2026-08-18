// Custom entry point.
// 1. `expo-router/entry` registers the root component (keeps file-based routing).
// 2. We register the Android widget task handler so the home-screen widget can
//    be rendered/updated by the OS even when the app UI isn't mounted.
import 'expo-router/entry';

import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('./src/widgets/widget-task-handler');
    registerWidgetTaskHandler(widgetTaskHandler);
  } catch (e) {
    // Native module not present (e.g. Expo Go) — safe to ignore.
  }
}

import 'expo-router/entry';
import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('./src/widgets/widget-task-handler');
    if (typeof registerWidgetTaskHandler === 'function' && widgetTaskHandler) {
      registerWidgetTaskHandler(widgetTaskHandler);
    }
  } catch (e) {
    console.warn('[Widget Task Handler Init Safely Skipped]:', e);
  }
}

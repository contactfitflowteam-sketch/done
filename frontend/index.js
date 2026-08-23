import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { Platform } from 'react-native';

if (Platform.OS === 'android') {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('./src/widgets/widget-task-handler');
    if (typeof registerWidgetTaskHandler === 'function') {
      registerWidgetTaskHandler(widgetTaskHandler);
    }
  } catch (e) {
    console.warn('[Widget Task Handler Init Safely Skipped]:', e);
  }
}

export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);

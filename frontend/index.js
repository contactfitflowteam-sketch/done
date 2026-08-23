import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import { Platform } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './src/widgets/widget-task-handler';

// Android Native Widget Background Binding
if (Platform.OS === 'android') {
  try {
    registerWidgetTaskHandler(widgetTaskHandler);
  } catch (e) {
    console.warn('[Widget] Task handler registration notice:', e);
  }
}

export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);

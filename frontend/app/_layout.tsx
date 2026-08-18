import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox, View, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useIconFonts } from '@/src/hooks/use-icon-fonts';
import { useStepTracking } from '@/src/hooks/use-step-tracking';
import { ThemeProvider, useTheme } from '@/src/theme';
import { StoreProvider } from '@/src/store';
import { I18nProvider } from '@/src/i18n';
import { initAdSession } from '@/src/ads/manager';

LogBox.ignoreAllLogs(true);
SplashScreen.preventAutoHideAsync();

function StepTrackingBridge() {
  useStepTracking();
  return null;
}

function ThemedShell() {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg }, animation: 'slide_from_right' }} />
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useIconFonts();

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  useEffect(() => { initAdSession(); }, []);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <StoreProvider>
              <StepTrackingBridge />
              <ThemedShell />
            </StoreProvider>
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

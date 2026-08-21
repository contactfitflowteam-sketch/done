import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { LogBox, View, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useIconFonts } from '@/src/hooks/use-icon-fonts';
import { useStepTracking } from '@/src/hooks/use-step-tracking';
import { ThemeProvider, useTheme } from '@/src/theme';
import { StoreProvider, useStore } from '@/src/store';
import { I18nProvider } from '@/src/i18n';
import { initAdSession } from '@/src/ads/manager';

LogBox.ignoreAllLogs(true);
SplashScreen.preventAutoHideAsync().catch(() => {});

function StepTrackingBridge() {
  useStepTracking();
  return null;
}

function ThemedShell({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { theme } = useTheme();
  const { state } = useStore();

  useEffect(() => {
    // Fonts load hone ke baad aur Store ready hone ke baad hi Splash Screen hide hogi
    const isReady = fontsLoaded && (!state.isLoading && state.isHydrated !== false);
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, state.isLoading, state.isHydrated]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
          animation: 'slide_from_right',
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useIconFonts();

  useEffect(() => {
    initAdSession();
  }, []);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <StoreProvider>
              <StepTrackingBridge />
              <ThemedShell fontsLoaded={!!(loaded || error)} />
            </StoreProvider>
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

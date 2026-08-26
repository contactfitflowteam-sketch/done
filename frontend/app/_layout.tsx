import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { LogBox, View, StatusBar, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useIconFonts } from '@/src/hooks/use-icon-fonts';
import { useStepTracking } from '@/src/hooks/use-step-tracking';
import { ThemeProvider, useTheme } from '@/src/theme';
import { StoreProvider, useStore } from '@/src/store';
import { I18nProvider } from '@/src/i18n';
import { scheduleStepNotification, requestNotificationPermission } from '@/src/utils/notifications';

LogBox.ignoreAllLogs(true);
SplashScreen.preventAutoHideAsync().catch(() => {});

function StepTrackingBridge() {
  useStepTracking();
  const { today } = useStore();
  const todayData = today();

  useEffect(() => {
    requestNotificationPermission();

    if (todayData) {
      scheduleStepNotification(todayData.steps || 0, todayData.calories || 0);
    }
  }, [todayData?.steps, todayData?.calories]);

  return null;
}

function ThemedShell({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { theme } = useTheme();
  const { state } = useStore();

  useEffect(() => {
    // 1.5s Safety fallback: Splash screen kabhi bhi app ko freeze karke nahi rakhegi
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1500);

    const isReady = fontsLoaded && (!state.isLoading && state.isHydrated !== false);
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
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
    if (Platform.OS !== 'android') return;
    let mounted = true;
    (async () => {
      try {
        const mod = await import('react-native-google-mobile-ads');
        if (!mounted) return;
        const mobileAds = mod.default;
        const MaxAdContentRating = mod.MaxAdContentRating;
        await mobileAds().setRequestConfiguration({
          maxAdContentRating: MaxAdContentRating.PG,
          tagForChildDirectedTreatment: false,
          tagForUnderAgeOfConsent: false,
        });
        await mobileAds().initialize();
      } catch (e) {
        console.warn('[AdMob] init skipped:', (e as Error)?.message);
      }
    })();
    return () => {
      mounted = false;
    };
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

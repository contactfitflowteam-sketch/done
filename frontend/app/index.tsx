import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useStore } from '@/src/store';

export default function Index() {
  const { state } = useStore();
  const [forcedReady, setForcedReady] = useState(false);

  // Maximum 1.2s timeout taaki store ke freeze hone par app kabhi stuck na ho
  useEffect(() => {
    const timer = setTimeout(() => {
      setForcedReady(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const isHydrated = (state && !state.isLoading && state.isHydrated !== false) || forcedReady;

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' }}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  // Routing checks
  if (!state.settings?.langSelected) {
    return <Redirect href="/language" />;
  }

  if (!state.settings?.onboarded) {
    return <Redirect href="/onboarding" />;
  }

  if (!state.settings?.permsRequested) {
    return <Redirect href="/permissions" />;
  }

  return <Redirect href="/(tabs)/home" />;
}

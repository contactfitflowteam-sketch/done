import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useStore } from '@/src/store';

export default function Index() {
  const { state } = useStore();

  // Agar store abhi hydrate / load ho raha ho toh loader dikhayega
  if (state.isLoading || state.isHydrated === false) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

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

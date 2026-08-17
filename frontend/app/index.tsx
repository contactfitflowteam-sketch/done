import { Redirect } from 'expo-router';
import { useStore } from '@/src/store';

export default function Index() {
  const { state } = useStore();

  if (!state.settings.langSelected) return <Redirect href="/language" />;
  if (!state.settings.onboarded) return <Redirect href="/onboarding" />;
  if (!state.settings.permsRequested) return <Redirect href="/permissions" />;
  return <Redirect href="/(tabs)/home" />;
}

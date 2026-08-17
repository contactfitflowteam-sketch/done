import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import { useI18n } from '@/src/i18n';

function CustomTabBar({ state, navigation }: any) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const icons: Record<string, any> = {
    home: 'home',
    steps: 'footsteps',
    workout: 'barbell',
    habits: 'checkmark-circle',
    body: 'body',
  };
  const labels: Record<string, string> = {
    home: t('home'),
    steps: t('steps'),
    workout: t('workout'),
    habits: t('habits'),
    body: t('body'),
  };

  const accent = theme.primary;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      <View style={[styles.pill, { backgroundColor: '#101010', borderColor: accent + '3A', shadowColor: theme.glow }]}>
        {state.routes.map((route: any, i: number) => {
          const focused = state.index === i;
          const iconName = icons[route.name] || 'ellipse';
          const label = labels[route.name] || route.name;
          return (
            <Pressable
              key={route.key}
              onPress={() => {
                const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
              }}
              style={[styles.tabItem, focused && { backgroundColor: accent + '28', shadowColor: theme.glow, shadowOpacity: 0.7, shadowRadius: 12, elevation: 8 }]}
              testID={`tab-${route.name}`}
            >
              <View style={styles.iconBubble}>
                <Ionicons name={iconName} size={20} color={focused ? accent : '#8A8A8A'} />
              </View>
              {focused && <Text style={[styles.labelActive, { color: accent }]} numberOfLines={1}>{label}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="steps" options={{ title: 'Steps' }} />
      <Tabs.Screen name="workout" options={{ title: 'Workout' }} />
      <Tabs.Screen name="habits" options={{ title: 'Habits' }} />
      <Tabs.Screen name="body" options={{ title: 'Body' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 6,
    width: '100%',
    borderWidth: 1,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 999, gap: 4 },
  iconBubble: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  labelActive: { fontSize: 11, fontWeight: '800', marginLeft: 2 },
});

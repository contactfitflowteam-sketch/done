import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import { useI18n } from '@/src/i18n';

function CustomTabBar({ state, descriptors, navigation }: any) {
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

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      <View style={styles.pill}>
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
              style={[styles.tabItem, focused && styles.tabItemActive]}
              testID={`tab-${route.name}`}
            >
              <View style={styles.iconBubble}>
                <Ionicons name={iconName} size={20} color={focused ? '#FF7A00' : '#8A8A8A'} />
              </View>
              {focused && (
                <Text style={styles.labelActive} numberOfLines={1}>{label}</Text>
              )}
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
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101010',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 6,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,122,0,0.22)',
    shadowColor: '#FF7A00',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    gap: 4,
  },
  tabItemActive: {
    backgroundColor: 'rgba(255,122,0,0.16)',
    shadowColor: '#FF7A00',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 8,
  },
  iconBubble: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubbleActive: {
    // active icon container
  },
  label: {
    color: '#8A8A8A',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  labelActive: {
    color: '#FF7A00',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 2,
  },
});

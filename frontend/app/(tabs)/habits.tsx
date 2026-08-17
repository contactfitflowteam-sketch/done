import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import { useStore, dateKey } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { GlassCard, ScreenHeader, NativeAdCard } from '@/src/components/ui';

const HABITS = [
  { id: 'water', key: 'drinkWater', icon: 'water' as const },
  { id: 'sleep', key: 'sleepGoal', icon: 'moon' as const },
  { id: 'workout', key: 'workout', icon: 'barbell' as const },
  { id: 'walk', key: 'walkGoal', icon: 'walk' as const },
  { id: 'activity', key: 'dailyActivity', icon: 'flash' as const },
];

export default function Habits() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { state, toggleHabit } = useStore();
  const today = dateKey();

  const streakOf = (id: string) => {
    const arr = state.habits[id] || [];
    if (!arr.includes(today)) return 0;
    let s = 0;
    const d = new Date();
    for (let i = 0; i < 365; i++) {
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (arr.includes(k)) s++; else break;
      d.setDate(d.getDate() - 1);
    }
    return s;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="habits-screen">
      <ScreenHeader title={t('habits')} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        <Text style={{ color: theme.textMuted, marginBottom: 12 }}>{t('habitsHint')}</Text>
        {HABITS.map((h, idx) => {
          const done = (state.habits[h.id] || []).includes(today);
          const streak = streakOf(h.id);
          return (
            <React.Fragment key={h.id}>
            <Pressable onPress={() => toggleHabit(h.id)} testID={`habit-${h.id}`}>
              <GlassCard style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }} glow={done}>
                <View style={[styles.hIcon, { backgroundColor: theme.primary + '22' }]}><Ionicons name={h.icon} size={22} color={theme.primary} /></View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>{t(h.key as any)}</Text>
                  <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>{streak > 0 ? `🔥 ${t('dayStreak', { n: streak })}` : t('startStreak')}</Text>
                </View>
                <View style={[styles.check, { backgroundColor: done ? theme.primary : 'transparent', borderColor: done ? theme.primary : theme.cardBorder, shadowColor: done ? theme.glow : 'transparent' }]}>
                  {done && <Ionicons name="checkmark" size={20} color={theme.name === 'amoled' ? '#000' : '#FFF'} />}
                </View>
              </GlassCard>
            </Pressable>
            {idx === 2 && <View style={{ marginBottom: 10 }}><NativeAdCard testID="habits-native-ad" /></View>}
            </React.Fragment>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  check: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.6, shadowRadius: 8, elevation: 4 },
});

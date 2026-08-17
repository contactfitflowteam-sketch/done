import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { useStore } from '@/src/store';
import { ScreenHeader, GlassCard, PillButton } from '@/src/components/ui';

const GOALS_ML = [1500, 2000, 2500, 3000, 3500, 4000];
const GLASSES = [100, 200, 250, 300, 500];

export default function WaterGoal() {
  const { theme } = useTheme();
  const { state, saveSettings } = useStore();
  const router = useRouter();
  const [g, setG] = useState(state.settings.waterGoalMl);
  const [glass, setGlass] = useState(state.settings.glassSizeMl);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="watergoal-screen">
      <ScreenHeader title="Hydration Goal" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <GlassCard glow style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ color: theme.textMuted, fontSize: 11, textTransform: 'uppercase' }}>Daily Goal</Text>
          <Text style={{ color: theme.text, fontSize: 44, fontWeight: '900', marginTop: 6 }}>{(g/1000).toFixed(1)} L</Text>
        </GlassCard>
        <Text style={{ color: theme.textMuted, marginTop: 20, marginBottom: 10, textTransform: 'uppercase', fontSize: 11 }}>Water Goal (ml)</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {GOALS_ML.map((v) => {
            const on = g === v;
            return <Pressable key={v} onPress={() => setG(v)} testID={`water-goal-${v}`} style={[styles.chip, { borderColor: on ? theme.primary : theme.cardBorder, backgroundColor: on ? theme.primary + '22' : 'transparent' }]}><Text style={{ color: on ? theme.primary : theme.text, fontWeight: '700' }}>{v}ml</Text></Pressable>;
          })}
        </View>
        <Text style={{ color: theme.textMuted, marginTop: 20, marginBottom: 10, textTransform: 'uppercase', fontSize: 11 }}>Glass Size</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {GLASSES.map((v) => {
            const on = glass === v;
            return <Pressable key={v} onPress={() => setGlass(v)} testID={`glass-${v}`} style={[styles.chip, { borderColor: on ? theme.primary : theme.cardBorder, backgroundColor: on ? theme.primary + '22' : 'transparent' }]}><Text style={{ color: on ? theme.primary : theme.text, fontWeight: '700' }}>{v}ml</Text></Pressable>;
          })}
        </View>
        <PillButton label="Save" onPress={() => { saveSettings({ waterGoalMl: g, glassSizeMl: glass }); router.back(); }} style={{ marginTop: 24 }} testID="save-water-goal" />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1 } });

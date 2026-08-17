import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { useStore } from '@/src/store';
import { ScreenHeader, GlassCard, PillButton } from '@/src/components/ui';

const HRS = [6, 7, 8, 9, 10];

export default function SleepGoal() {
  const { theme } = useTheme();
  const { state, saveSettings } = useStore();
  const router = useRouter();
  const [g, setG] = useState(state.settings.sleepGoalHr);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="sleepgoal-screen">
      <ScreenHeader title="Sleep Goal" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <GlassCard glow style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ color: theme.text, fontSize: 56, fontWeight: '900' }}>{g}h</Text>
          <Text style={{ color: theme.primary, marginTop: 4, fontWeight: '700' }}>per night</Text>
        </GlassCard>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
          {HRS.map((v) => {
            const on = g === v;
            return <Pressable key={v} onPress={() => setG(v)} testID={`sleep-${v}`} style={[styles.chip, { borderColor: on ? theme.primary : theme.cardBorder, backgroundColor: on ? theme.primary + '22' : 'transparent' }]}><Text style={{ color: on ? theme.primary : theme.text, fontWeight: '700' }}>{v} hours</Text></Pressable>;
          })}
        </View>
        <PillButton label="Save" onPress={() => { saveSettings({ sleepGoalHr: g }); router.back(); }} style={{ marginTop: 24 }} testID="save-sleep-goal" />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, borderWidth: 1 } });

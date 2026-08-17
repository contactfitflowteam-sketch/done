import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { useStore } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { ScreenHeader, GlassCard, PillButton } from '@/src/components/ui';

const PRESETS = [5000, 7500, 10000, 12500, 15000, 20000, 25000];
const MIN = 1000;
const MAX = 50000;
const STEP = 100;

export default function StepGoal() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { state, saveSettings } = useStore();
  const router = useRouter();
  const [g, setG] = useState(state.settings.stepGoal);

  const dec = () => setG((v) => Math.max(MIN, v - STEP));
  const inc = () => setG((v) => Math.min(MAX, v + STEP));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="stepgoal-screen">
      <ScreenHeader title={t('dailyStepGoal')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <GlassCard glow style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11 }}>{t('selectedGoal')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 20 }}>
            <Pressable onPress={dec} onLongPress={() => setG((v) => Math.max(MIN, v - 1000))} testID="stepgoal-minus" style={[styles.roundBtn, { borderColor: theme.cardBorder, backgroundColor: theme.bgElev }]}>
              <Ionicons name="remove" size={26} color={theme.text} />
            </Pressable>
            <Text style={{ color: theme.text, fontSize: 44, fontWeight: '900', minWidth: 140, textAlign: 'center' }} testID="stepgoal-value">{g.toLocaleString()}</Text>
            <Pressable onPress={inc} onLongPress={() => setG((v) => Math.min(MAX, v + 1000))} testID="stepgoal-plus" style={[styles.roundBtn, { borderColor: theme.primary, backgroundColor: theme.primary + '22', shadowColor: theme.glow }]}>
              <Ionicons name="add" size={26} color={theme.primary} />
            </Pressable>
          </View>
          <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700', marginTop: 12 }}>{t('stepsPerDay')}</Text>
        </GlassCard>

        <View style={{ marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {PRESETS.map((v) => {
            const on = g === v;
            return (
              <Pressable key={v} onPress={() => setG(v)} testID={`goal-${v}`} style={[styles.chip, { borderColor: on ? theme.primary : theme.cardBorder, backgroundColor: on ? theme.primary + '22' : 'transparent' }]}>
                <Text style={{ color: on ? theme.primary : theme.text, fontWeight: '700' }}>{v.toLocaleString()}</Text>
              </Pressable>
            );
          })}
        </View>
        <PillButton label={t('saveGoal')} onPress={() => { saveSettings({ stepGoal: g }); router.back(); }} style={{ marginTop: 24 }} testID="save-step-goal" />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  chip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999, borderWidth: 1 },
  roundBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.5, shadowRadius: 12, elevation: 4 },
});

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { useStore, last7Days } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { ScreenHeader, GlassCard, BarChart, PillButton } from '@/src/components/ui';

export default function Sleep() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { state, today, setSleep } = useStore();
  const router = useRouter();
  const tday = today();
  const week = last7Days(state.days);
  const [h, setH] = useState(String(Math.floor(tday.sleepMin / 60)));
  const [m, setM] = useState(String(tday.sleepMin % 60));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="sleep-screen">
      <ScreenHeader title={t('sleep')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        <GlassCard glow style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ color: theme.textMuted, fontSize: 11, textTransform: 'uppercase' }}>{t('lastNight')}</Text>
          <Text style={{ color: theme.text, fontSize: 48, fontWeight: '900', marginTop: 6 }}>{Math.floor(tday.sleepMin / 60)}h {tday.sleepMin % 60}m</Text>
          <Text style={{ color: theme.primary, marginTop: 4, fontWeight: '700' }}>{t('sleepGoal')} {state.settings.sleepGoalHr}h</Text>
        </GlassCard>

        <GlassCard style={{ marginTop: 16 }}>
          <Text style={{ color: theme.text, fontWeight: '800', marginBottom: 12 }}>{t('logSleep')}</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 4 }}>{t('hours')}</Text>
              <TextInput value={h} onChangeText={setH} keyboardType="numeric" style={[styles.input, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.bgElev }]} testID="sleep-hours" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 4 }}>{t('minutes')}</Text>
              <TextInput value={m} onChangeText={setM} keyboardType="numeric" style={[styles.input, { color: theme.text, borderColor: theme.cardBorder, backgroundColor: theme.bgElev }]} testID="sleep-minutes" />
            </View>
          </View>
          <PillButton label={t('saveSleep')} onPress={() => setSleep((parseInt(h) || 0) * 60 + (parseInt(m) || 0))} style={{ marginTop: 14 }} testID="sleep-save" />
        </GlassCard>

        <GlassCard style={{ marginTop: 16 }}>
          <Text style={{ color: theme.text, fontWeight: '800', marginBottom: 12 }}>{t('weeklySleep')}</Text>
          <BarChart data={week.map((d) => ({ label: ['S','M','T','W','T','F','S'][new Date(d.date).getDay()], value: d.sleepMin / 60 }))} />
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ input: { fontSize: 16, fontWeight: '700', padding: 12, borderRadius: 12, borderWidth: 1 } });

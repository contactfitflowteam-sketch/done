import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { useStore, last7Days } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { ScreenHeader, GlassCard, BarChart, Segmented, AdBanner } from '@/src/components/ui';

export default function Calories() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { state, today } = useStore();
  const router = useRouter();
  const [r, setR] = useState(t('week'));
  const week = last7Days(state.days);
  const total = week.reduce((a, d) => a + d.caloriesBurned, 0);
  const tday = today();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="calories-screen">
      <ScreenHeader title={t('calories')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        <Segmented options={[t('week'), t('month')]} value={r} onChange={setR} testID="cal-range" />
        <GlassCard glow style={{ marginTop: 16, alignItems: 'flex-start' }}>
          <Text style={{ color: theme.textMuted, fontSize: 11, textTransform: 'uppercase' }}>{t('today')}</Text>
          <Text style={{ color: theme.text, fontSize: 44, fontWeight: '900', marginTop: 4 }}>{tday.caloriesBurned}<Text style={{ color: theme.textMuted, fontSize: 18, fontWeight: '700' }}> kcal</Text></Text>
          <Text style={{ color: theme.primary, fontWeight: '700', marginTop: 4 }}>{t('weeklyTotal')} {total} kcal</Text>
          <View style={{ marginTop: 16 }}>
            <BarChart data={week.map((d) => ({ label: ['S','M','T','W','T','F','S'][new Date(d.date).getDay()], value: d.caloriesBurned }))} />
          </View>
        </GlassCard>
        <GlassCard style={{ marginTop: 16 }}>
          <Text style={{ color: theme.text, fontWeight: '800', marginBottom: 8 }}>{t('estimatedBurn')}</Text>
          <Text style={{ color: theme.textMuted }}>Based on weight {state.profile.weightKg}kg and today{"'"}s activity.</Text>
        </GlassCard>
        <AdBanner />
      </ScrollView>
    </SafeAreaView>
  );
}

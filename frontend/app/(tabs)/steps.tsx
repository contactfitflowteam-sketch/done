import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import { useStore, last7Days } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { GlassCard, ScreenHeader, AdBanner, NativeAdCard } from '@/src/components/ui';
import { AnalyticsChart } from '@/src/components/analytics';

export default function StepsPage() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { state } = useStore();
  const week = last7Days(state.days);
  const weekTotal = week.reduce((a, d) => a + d.steps, 0);
  const avg = Math.round(weekTotal / 7);
  const best = Math.max(...week.map((d) => d.steps), 0);
  const totalKcal = week.reduce((a, d) => a + d.caloriesBurned, 0);
  const totalKm = week.reduce((a, d) => a + d.distanceKm, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="steps-screen">
      <ScreenHeader title={t('steps')} testID="steps-header" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <GlassCard glow style={{ alignItems: 'flex-start' }} testID="steps-total-card">
          <Text style={{ color: theme.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6 }}>{t('your')} {t('week')}</Text>
          <Text style={{ color: theme.text, fontSize: 44, fontWeight: '900', marginTop: 4, letterSpacing: -1 }}>{weekTotal.toLocaleString()}</Text>
          <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700', marginTop: 4 }}>{t('avgSteps', { n: avg.toLocaleString() })}</Text>
        </GlassCard>

        {/* Advanced analytics */}
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800', marginTop: 20, marginBottom: 8 }}>Analytics</Text>
        <AnalyticsChart />

        <Text style={{ color: theme.text, fontSize: 15, fontWeight: '800', marginTop: 24, marginBottom: 10 }}>{t('insights')}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <GlassCard style={styles.miniCard}><Text style={styles.mLabel(theme)}>{t('totalDistance')}</Text><Text style={styles.mVal(theme)}>{totalKm.toFixed(2)}<Text style={styles.mUnit(theme)}> km</Text></Text></GlassCard>
          <GlassCard style={styles.miniCard}><Text style={styles.mLabel(theme)}>{t('totalCalories')}</Text><Text style={styles.mVal(theme)}>{totalKcal}<Text style={styles.mUnit(theme)}> kcal</Text></Text></GlassCard>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <GlassCard style={styles.miniCard}><Text style={styles.mLabel(theme)}>{t('bestDay')}</Text><Text style={styles.mVal(theme)}>{best.toLocaleString()}</Text></GlassCard>
          <GlassCard style={styles.miniCard}><Text style={styles.mLabel(theme)}>{t('activeTime')}</Text><Text style={styles.mVal(theme)}>{Math.round(weekTotal * 0.0006)}h</Text></GlassCard>
        </View>

        <View style={{ marginTop: 16 }}><NativeAdCard testID="steps-native-ad" /></View>
        <AdBanner />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles: any = StyleSheet.create({
  miniCard: { flex: 1, padding: 14 },
});
styles.mLabel = (t: any) => ({ color: t.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 });
styles.mVal = (t: any) => ({ color: t.text, fontSize: 22, fontWeight: '800', marginTop: 6 });
styles.mUnit = (t: any) => ({ color: t.textMuted, fontSize: 12, fontWeight: '600' });

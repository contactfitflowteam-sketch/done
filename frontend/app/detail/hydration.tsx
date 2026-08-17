import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Rect, Defs, LinearGradient, Stop, ClipPath, Path, G } from 'react-native-svg';
import { useTheme } from '@/src/theme';
import { useStore, last7Days } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { ScreenHeader, GlassCard, BarChart } from '@/src/components/ui';

const QUICK = [100, 200, 250, 300, 500];

export default function Hydration() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { state, today, addWater } = useStore();
  const router = useRouter();
  const tday = today();
  const goal = state.settings.waterGoalMl;
  const pct = Math.min(1, tday.water / goal);
  const week = last7Days(state.days);
  const glass = state.settings.glassSizeMl;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="hydration-screen">
      <ScreenHeader title={t('hydration')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        <GlassCard glow style={{ alignItems: 'center', paddingVertical: 24 }} testID="hydration-hero">
          <View style={{ width: 160, height: 220, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={140} height={200}>
              <Defs>
                <LinearGradient id="waterG" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={theme.info} stopOpacity="0.9" />
                  <Stop offset="100%" stopColor={theme.info} stopOpacity="0.4" />
                </LinearGradient>
                <ClipPath id="glass">
                  <Path d="M20 10 L120 10 L110 190 L30 190 Z" />
                </ClipPath>
              </Defs>
              <Path d="M20 10 L120 10 L110 190 L30 190 Z" stroke={theme.info} strokeWidth={3} fill="rgba(62,197,255,0.05)" />
              <G clipPath="url(#glass)">
                <Rect x={0} y={200 - pct * 190} width={140} height={pct * 190} fill="url(#waterG)" />
              </G>
            </Svg>
          </View>
          <Text style={{ color: theme.text, fontSize: 40, fontWeight: '900', marginTop: 8 }}>{(tday.water / 1000).toFixed(2)}<Text style={{ color: theme.textMuted, fontSize: 20, fontWeight: '700' }}> / {(goal / 1000).toFixed(1)} L</Text></Text>
          <Text style={{ color: theme.info, fontWeight: '700', marginTop: 4 }}>{Math.round(pct * 100)}% {t('ofDailyGoal')}</Text>
        </GlassCard>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          {[1, 2, 3].map((n) => (
            <Pressable key={n} onPress={() => addWater(glass * n)} testID={`add-glass-${n}`} style={{ flex: 1 }}>
              <GlassCard style={{ alignItems: 'center', paddingVertical: 16 }}>
                <Ionicons name="water" size={24} color={theme.info} />
                <Text style={{ color: theme.text, fontWeight: '800', marginTop: 6 }}>+{n} {t('glass')}</Text>
                <Text style={{ color: theme.textFaint, fontSize: 11 }}>{glass * n}ml</Text>
              </GlassCard>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: theme.textMuted, marginTop: 16, marginBottom: 8, textTransform: 'uppercase', fontSize: 11 }}>{t('quickAdd')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {QUICK.map((ml) => (
            <Pressable key={ml} onPress={() => addWater(ml)} testID={`add-ml-${ml}`} style={[styles.chip, { borderColor: theme.cardBorder }]}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>+{ml}ml</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => addWater(-glass)} testID="undo-water" style={[styles.chip, { borderColor: theme.danger + '77' }]}>
            <Text style={{ color: theme.danger, fontWeight: '700' }}>−1 {t('glass')}</Text>
          </Pressable>
        </View>

        <GlassCard style={{ marginTop: 16 }}>
          <Text style={{ color: theme.text, fontWeight: '800', marginBottom: 12 }}>{t('weeklyHistory')}</Text>
          <BarChart data={week.map((d) => ({ label: ['S','M','T','W','T','F','S'][new Date(d.date).getDay()], value: d.water }))} />
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1 } });

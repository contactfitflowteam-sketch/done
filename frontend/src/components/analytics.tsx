import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Defs, LinearGradient, Stop, G, Text as SvgText, Line } from 'react-native-svg';
import { useTheme } from '@/src/theme';
import { useStore, DayEntry } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { GlassCard } from './ui';

type Metric = 'steps' | 'distance' | 'calories' | 'hydration' | 'habits';
type Range = 'daily' | 'weekly' | 'monthly';

const HABIT_IDS = ['water', 'sleep', 'workout', 'walk', 'activity'];

function keyOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const AnalyticsChart: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { state } = useStore();
  const [metric, setMetric] = useState<Metric>('steps');
  const [range, setRange] = useState<Range>('weekly');
  const [selected, setSelected] = useState<number | null>(null);

  const metricInfo: Record<Metric, { label: string; icon: any; color: string; unit: string; fmt: (n: number) => string }> = {
    steps: { label: t('steps'), icon: 'walk', color: theme.primary, unit: '', fmt: (n) => Math.round(n).toLocaleString() },
    distance: { label: t('distance'), icon: 'location', color: theme.info, unit: 'km', fmt: (n) => n.toFixed(2) },
    calories: { label: t('calories'), icon: 'flame', color: theme.secondary, unit: 'kcal', fmt: (n) => Math.round(n).toString() },
    hydration: { label: t('hydration'), icon: 'water', color: '#3EC5FF', unit: 'L', fmt: (n) => (n / 1000).toFixed(2) },
    habits: { label: t('habits'), icon: 'checkmark-done', color: theme.success, unit: '%', fmt: (n) => `${Math.round(n)}` },
  };

  const valueOf = (entry: DayEntry, dateStr: string): number => {
    switch (metric) {
      case 'steps': return entry.steps;
      case 'distance': return entry.distanceKm;
      case 'calories': return entry.caloriesBurned;
      case 'hydration': return entry.water;
      case 'habits': {
        const done = HABIT_IDS.filter((h) => (state.habits[h] || []).includes(dateStr)).length;
        return (done / HABIT_IDS.length) * 100;
      }
    }
  };

  const { bars, avg, best, trend } = useMemo(() => {
    const out: { label: string; value: number; full: string }[] = [];
    const today = new Date();
    if (range === 'daily') {
      // last 24 hours split into 8 x 3h buckets from today's total (even distribution estimate)
      const entry = state.days[keyOf(today)] || { date: keyOf(today), steps: 0, water: 0, sleepMin: 0, caloriesBurned: 0, distanceKm: 0 };
      const total = valueOf(entry, keyOf(today));
      for (let i = 0; i < 8; i++) {
        out.push({ label: `${i * 3}h`, value: total / 8, full: `${i * 3}:00` });
      }
    } else if (range === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const k = keyOf(d);
        const entry = state.days[k] || { date: k, steps: 0, water: 0, sleepMin: 0, caloriesBurned: 0, distanceKm: 0 };
        out.push({ label: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()], value: valueOf(entry, k), full: k });
      }
    } else {
      // monthly: last 6 weeks totals/averages
      for (let w = 5; w >= 0; w--) {
        let sum = 0; let cnt = 0;
        for (let day = 0; day < 7; day++) {
          const d = new Date(today); d.setDate(today.getDate() - (w * 7 + day));
          const k = keyOf(d);
          const entry = state.days[k];
          if (entry) { sum += valueOf(entry, k); cnt++; }
          else if (metric === 'habits') { cnt++; }
        }
        const val = metric === 'steps' || metric === 'calories' || metric === 'hydration' || metric === 'distance' ? sum : (cnt ? sum / cnt : 0);
        out.push({ label: `W${6 - w}`, value: val, full: `Week ${6 - w}` });
      }
    }
    const vals = out.map((o) => o.value);
    const nonZero = vals.filter((v) => v > 0);
    const average = nonZero.length ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length : 0;
    const bestIdx = vals.indexOf(Math.max(...vals));
    // trend: compare last half vs first half
    const half = Math.floor(vals.length / 2);
    const firstAvg = vals.slice(0, half).reduce((a, b) => a + b, 0) / Math.max(1, half);
    const lastAvg = vals.slice(half).reduce((a, b) => a + b, 0) / Math.max(1, vals.length - half);
    const trendPct = firstAvg > 0 ? Math.round(((lastAvg - firstAvg) / firstAvg) * 100) : 0;
    return { bars: out, avg: average, best: { idx: bestIdx, ...out[bestIdx] }, trend: trendPct };
  }, [metric, range, state]); // eslint-disable-line

  const info = metricInfo[metric];
  const W = 320;
  const H = 200;
  const max = Math.max(1, ...bars.map((b) => b.value));
  const barW = (W - 24) / bars.length - 8;

  return (
    <View>
      {/* Metric selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {(Object.keys(metricInfo) as Metric[]).map((m) => {
          const on = m === metric;
          const mi = metricInfo[m];
          return (
            <Pressable key={m} onPress={() => { setMetric(m); setSelected(null); }} testID={`metric-${m}`} style={[styles.metricChip, { flexShrink: 0, backgroundColor: on ? mi.color : theme.bgElev, borderColor: on ? mi.color : theme.cardBorder }]}>
              <Ionicons name={mi.icon} size={15} color={on ? (theme.name === 'amoled' ? '#000' : '#FFF') : theme.textMuted} />
              <Text style={{ color: on ? (theme.name === 'amoled' ? '#000' : '#FFF') : theme.textMuted, marginLeft: 6, fontWeight: '700', fontSize: 12 }}>{mi.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Range tabs */}
      <View style={[styles.rangeWrap, { backgroundColor: theme.bgElev, borderColor: theme.cardBorder }]}>
        {(['daily', 'weekly', 'monthly'] as Range[]).map((r) => {
          const on = r === range;
          return (
            <Pressable key={r} onPress={() => { setRange(r); setSelected(null); }} testID={`range-${r}`} style={[styles.rangeItem, on && { backgroundColor: info.color }]}>
              <Text style={{ color: on ? (theme.name === 'amoled' ? '#000' : '#FFF') : theme.textMuted, fontWeight: '700', fontSize: 13 }}>{t(r)}</Text>
            </Pressable>
          );
        })}
      </View>

      <GlassCard glow style={{ marginTop: 12 }}>
        {/* selected value readout */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <View>
            <Text style={{ color: theme.textMuted, fontSize: 11, textTransform: 'uppercase' }}>{selected != null ? bars[selected].full : t('avg')}</Text>
            <Text style={{ color: theme.text, fontSize: 28, fontWeight: '900', marginTop: 2 }}>
              {info.fmt(selected != null ? bars[selected].value : avg)}<Text style={{ color: theme.textMuted, fontSize: 14, fontWeight: '700' }}> {info.unit}</Text>
            </Text>
          </View>
          <View style={[styles.trendChip, { backgroundColor: (trend >= 0 ? theme.success : theme.danger) + '22' }]}>
            <Ionicons name={trend >= 0 ? 'trending-up' : 'trending-down'} size={14} color={trend >= 0 ? theme.success : theme.danger} />
            <Text style={{ color: trend >= 0 ? theme.success : theme.danger, fontWeight: '800', marginLeft: 4, fontSize: 12 }}>{trend >= 0 ? '+' : ''}{trend}%</Text>
          </View>
        </View>

        {/* Chart */}
        <Svg width={W} height={H}>
          <Defs>
            <LinearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={info.color} />
              <Stop offset="100%" stopColor={info.color} stopOpacity="0.35" />
            </LinearGradient>
          </Defs>
          {[0, 1, 2, 3].map((i) => (
            <Line key={i} x1={0} x2={W} y1={20 + (i * (H - 50)) / 3} y2={20 + (i * (H - 50)) / 3} stroke={theme.divider} strokeWidth={1} />
          ))}
          {bars.map((b, i) => {
            const h = Math.max(3, (b.value / max) * (H - 50));
            const x = 12 + i * ((W - 24) / bars.length) + 4;
            const y = H - 30 - h;
            const on = selected === i;
            return (
              <G key={i} onPress={() => setSelected(on ? null : i)}>
                <Rect x={x - 2} y={0} width={barW + 8} height={H} fill="transparent" />
                <Rect x={x} y={y} width={barW} height={h} rx={6} fill={on ? info.color : 'url(#aGrad)'} />
                {on && <SvgText x={x + barW / 2} y={y - 6} fill={theme.text} fontSize={10} fontWeight="bold" textAnchor="middle">{info.fmt(b.value)}</SvgText>}
                <SvgText x={x + barW / 2} y={H - 12} fill={on ? info.color : theme.textFaint} fontSize={10} textAnchor="middle">{b.label}</SvgText>
              </G>
            );
          })}
        </Svg>
        <Text style={{ color: theme.textFaint, fontSize: 11, textAlign: 'center', marginTop: 4 }}>{t('tapPoint')}</Text>
      </GlassCard>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        <GlassCard style={{ flex: 1, padding: 14 }}>
          <Text style={{ color: theme.textMuted, fontSize: 11, textTransform: 'uppercase' }}>{t('avg')}</Text>
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800', marginTop: 4 }}>{info.fmt(avg)} <Text style={{ fontSize: 11, color: theme.textMuted }}>{info.unit}</Text></Text>
        </GlassCard>
        <GlassCard style={{ flex: 1, padding: 14 }}>
          <Text style={{ color: theme.textMuted, fontSize: 11, textTransform: 'uppercase' }}>{t('bestDay')}</Text>
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: '800', marginTop: 4 }}>{info.fmt(best.value)} <Text style={{ fontSize: 11, color: theme.textMuted }}>{info.unit}</Text></Text>
          <Text style={{ color: theme.textFaint, fontSize: 11 }}>{best.label}</Text>
        </GlassCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  metricChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1 },
  rangeWrap: { flexDirection: 'row', padding: 4, borderRadius: 999, borderWidth: 1, marginTop: 12 },
  rangeItem: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  trendChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
});

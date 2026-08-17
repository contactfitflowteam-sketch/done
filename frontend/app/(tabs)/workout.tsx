import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import { useStore, WorkoutSession } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { GlassCard, ScreenHeader, PillButton } from '@/src/components/ui';

const TYPES = [
  { id: 'walking', key: 'walking', icon: 'walk' as const, met: 3.5 },
  { id: 'running', key: 'running', icon: 'flash' as const, met: 8 },
  { id: 'cycling', key: 'cycling', icon: 'bicycle' as const, met: 7.5 },
  { id: 'custom', key: 'custom', icon: 'barbell' as const, met: 5 },
];

export default function Workout() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { state, addWorkout } = useStore();
  const [type, setType] = useState(TYPES[0]);
  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const iv = useRef<any>(null);

  useEffect(() => {
    if (active && !paused) {
      iv.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (iv.current) { clearInterval(iv.current); iv.current = null; }
    return () => { if (iv.current) clearInterval(iv.current); };
  }, [active, paused]);

  const km = (seconds / 3600) * (type.id === 'cycling' ? 22 : type.id === 'running' ? 10 : 5);
  const kcal = Math.round(type.met * state.profile.weightKg * (seconds / 3600));
  const format = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const stop = () => {
    if (seconds > 5) {
      const w: WorkoutSession = { id: `${Date.now()}`, type: t(type.key as any), startTs: Date.now() - seconds * 1000, endTs: Date.now(), durationSec: seconds, distanceKm: parseFloat(km.toFixed(2)), calories: kcal };
      addWorkout(w);
    }
    setActive(false); setPaused(false); setSeconds(0);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="workout-screen">
      <ScreenHeader title={t('workout')} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
          {TYPES.map((tp) => {
            const on = tp.id === type.id;
            return (
              <Pressable key={tp.id} onPress={() => !active && setType(tp)} testID={`workout-type-${tp.id}`} style={[styles.typeChip, { backgroundColor: on ? theme.primary : theme.bgElev, borderColor: on ? theme.primary : theme.cardBorder, flexShrink: 0 }]}>
                <Ionicons name={tp.icon} size={18} color={on ? (theme.name === 'amoled' ? '#000' : '#FFF') : theme.text} />
                <Text style={{ color: on ? (theme.name === 'amoled' ? '#000' : '#FFF') : theme.text, marginLeft: 8, fontWeight: '700' }}>{t(tp.key as any)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <GlassCard glow style={{ marginTop: 20, alignItems: 'center', paddingVertical: 28 }} testID="workout-live-card">
          <Text style={{ color: theme.textMuted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 }}>{t(type.key as any)} · {active ? (paused ? t('paused') : t('live')) : t('ready')}</Text>
          <Text style={{ color: theme.text, fontSize: 56, fontWeight: '900', letterSpacing: -2, marginTop: 8 }}>{format(seconds)}</Text>
          <View style={{ flexDirection: 'row', marginTop: 20, gap: 24 }}>
            <View style={{ alignItems: 'center' }}><Text style={{ color: theme.textMuted, fontSize: 11 }}>{t('distance').toUpperCase()}</Text><Text style={{ color: theme.text, fontSize: 20, fontWeight: '800', marginTop: 4 }}>{km.toFixed(2)} km</Text></View>
            <View style={{ alignItems: 'center' }}><Text style={{ color: theme.textMuted, fontSize: 11 }}>{t('calories').toUpperCase()}</Text><Text style={{ color: theme.text, fontSize: 20, fontWeight: '800', marginTop: 4 }}>{kcal} kcal</Text></View>
          </View>

          {!active && <PillButton label={`${t('start')} ${t(type.key as any)}`} onPress={() => setActive(true)} icon="play" testID="workout-start" style={{ marginTop: 24, alignSelf: 'stretch' }} />}
          {active && (
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, alignSelf: 'stretch' }}>
              <View style={{ flex: 1 }}><PillButton label={paused ? t('resume') : t('pause')} onPress={() => setPaused((p) => !p)} icon={paused ? 'play' : 'pause'} variant="ghost" testID="workout-pause" /></View>
              <View style={{ flex: 1 }}><PillButton label={t('stop')} onPress={stop} icon="stop" variant="danger" testID="workout-stop" /></View>
            </View>
          )}
        </GlassCard>

        <Text style={{ color: theme.text, fontSize: 15, fontWeight: '800', marginTop: 20, marginBottom: 8 }}>{t('recentSessions')}</Text>
        {state.workouts.length === 0 && (
          <GlassCard><Text style={{ color: theme.textMuted, textAlign: 'center', paddingVertical: 12 }}>{t('noWorkouts')}</Text></GlassCard>
        )}
        {state.workouts.slice(0, 10).map((w) => (
          <GlassCard key={w.id} style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }} testID={`workout-${w.id}`}>
            <View style={[styles.iconOrb, { backgroundColor: theme.primary + '22' }]}><Ionicons name="fitness" size={20} color={theme.primary} /></View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>{w.type}</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>{new Date(w.startTs).toLocaleString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: theme.text, fontWeight: '800' }}>{Math.floor(w.durationSec / 60)}m</Text>
              <Text style={{ color: theme.textMuted, fontSize: 12 }}>{w.calories} kcal · {w.distanceKm}km</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  typeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  iconOrb: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});

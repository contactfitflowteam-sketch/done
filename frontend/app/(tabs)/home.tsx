import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import Svg, { Circle, Defs, LinearGradient, Stop, Path, Line as SvgLine, Text as SvgText, G } from 'react-native-svg';

import { useTheme, Palette } from '@/src/theme';
import { useStore, last7Days } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { Sheet, PillButton } from '@/src/components/ui';
import { trackInteraction, maybeShowInterstitial } from '@/src/ads/manager';
import { updateStepsWidget } from '@/src/widgets/widget-data';
import { NativeAdSlot } from '@/src/ads/NativeAdSlot';
import { BannerAdSlot } from '@/src/ads/BannerAdSlot';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type HomeColors = {
  cardBg: string;
  cardBg2: string;
  text: string;
  textSec: string;
  textFaint: string;
  border: string;
  ringTrack: string;
  gridLine: string;
  progTrack: string;
  prevLine: string;
  accent: string;
  accent2: string;
  accentSoft: string;
  glow: string;
  completeChipBg: string;
  editBtnBg: string;
  streakBg: string;
};

function buildColors(theme: Palette, appearance: 'dark' | 'light'): HomeColors {
  const accent = theme.primary;
  const accent2 = theme.secondary;
  const glow = theme.glow;
  if (appearance === 'light') {
    return {
      cardBg: '#F7F6F1',
      cardBg2: '#FFFFFF',
      text: '#1A1A1A',
      textSec: '#6B6B6B',
      textFaint: '#9A9A9A',
      border: '#EFECE4',
      ringTrack: '#FFFFFF',
      gridLine: '#ECE8DD',
      progTrack: '#EAE5D8',
      prevLine: '#C9C6BE',
      accent,
      accent2,
      accentSoft: accent + '22',
      glow,
      completeChipBg: accent,
      editBtnBg: '#FFFFFF',
      streakBg: '#151515',
    };
  }
  return {
    cardBg: '#101010',
    cardBg2: '#0A0A0A',
    text: '#FFFFFF',
    textSec: '#B8B8B8',
    textFaint: '#6B6B6B',
    border: accent + '3A',
    ringTrack: '#FFFFFF',
    gridLine: '#242424',
    progTrack: '#242424',
    prevLine: '#C9C6BE',
    accent,
    accent2,
    accentSoft: accent + '28',
    glow,
    completeChipBg: '#1A1A1A',
    editBtnBg: '#1B1B1B',
    streakBg: '#171717',
  };
}

function BigStepRing({ steps, goal, c, size = 220 }: { steps: number; goal: number; c: HomeColors; size?: number }) {
  const stroke = 22;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, steps / Math.max(1, goal));
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);

  const strokeDashoffset = anim.interpolate({ inputRange: [0, 1], outputRange: [circ, 0] });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGradHome" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={c.accent} />
            <Stop offset="100%" stopColor={c.accent2} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.ringTrack} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGradHome)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Ionicons name="footsteps" size={22} color={c.accent} style={{ marginBottom: 6 }} />
        <Text style={{ color: c.text, fontSize: 40, fontWeight: '900', letterSpacing: -1.5 }}>
          {steps.toLocaleString()}
        </Text>
        <Text style={{ color: c.textSec, fontSize: 13, marginTop: 2 }}>Steps</Text>
        <View style={{ marginTop: 8, backgroundColor: c.completeChipBg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: c.accent + '66' }}>
          <Text style={{ color: c.completeChipBg === c.accent ? '#FFFFFF' : c.accent, fontSize: 11, fontWeight: '800' }}>{Math.round(pct * 100)}% Complete</Text>
        </View>
      </View>
    </View>
  );
}

function WaveLine({ color }: { color: string }) {
  return (
    <Svg width={90} height={16} viewBox="0 0 90 16">
      <Path d="M 0 8 Q 11 0, 22 8 T 45 8 T 68 8 T 90 8" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function WeeklyChart({ current, previous, c, height = 170 }: { current: number[]; previous: number[]; c: HomeColors; height?: number }) {
  const W = 320;
  const padL = 30, padR = 10, padT = 10, padB = 24;
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = Math.max(15000, ...current, ...previous);
  const yTicks = [0, 5000, 10000, 15000];
  const xFor = (i: number, n: number) => padL + (i * (W - padL - padR)) / Math.max(1, n - 1);
  const yFor = (v: number) => padT + (1 - v / max) * (height - padT - padB);
  const path = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i, arr.length)} ${yFor(v)}`).join(' ');

  return (
    <Svg width={W} height={height}>
      {yTicks.map((v) => (
        <G key={v}>
          <SvgLine x1={padL} x2={W - padR} y1={yFor(v)} y2={yFor(v)} stroke={c.gridLine} strokeWidth={1} />
          <SvgText x={padL - 6} y={yFor(v) + 4} fontSize={10} fill={c.textFaint} textAnchor="end">
            {v === 0 ? '0' : `${v / 1000}K`}
          </SvgText>
        </G>
      ))}
      <Path d={path(previous)} stroke={c.prevLine} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {previous.map((v, i) => (
        <Circle key={'p' + i} cx={xFor(i, previous.length)} cy={yFor(v)} r={3} fill={c.prevLine} />
      ))}
      <Path d={path(current)} stroke={c.accent} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {current.map((v, i) => {
        const isLast = i === current.length - 1;
        return (
          <G key={'c' + i}>
            {isLast
              ? <Circle cx={xFor(i, current.length)} cy={yFor(v)} r={7} fill={c.cardBg} stroke={c.accent} strokeWidth={3} />
              : <Circle cx={xFor(i, current.length)} cy={yFor(v)} r={3.5} fill={c.accent} />}
          </G>
        );
      })}
      {labels.map((lbl, i) => (
        <SvgText key={lbl} x={xFor(i, labels.length)} y={height - 6} fontSize={11} fill={c.textSec} textAnchor="middle">
          {lbl}
        </SvgText>
      ))}
    </Svg>
  );
}

function StatCardLight({ icon, label, value, sub, progress, c, testID, onPress }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string; value: string; sub?: string; progress?: number; c: HomeColors; testID?: string; onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.statCard, { backgroundColor: c.cardBg, borderColor: c.border, shadowColor: c.glow }]} testID={testID}>
      <View style={[styles.statIconWrap, { backgroundColor: c.accentSoft, shadowColor: c.glow }]}>
        <Ionicons name={icon} size={16} color={c.accent} />
      </View>
      <Text style={[styles.statLabel, { color: c.textSec }]} numberOfLines={1}>{label}</Text>
      <Text style={[styles.statValue, { color: c.text }]} numberOfLines={1}>{value}</Text>
      {!!sub && <Text style={[styles.statSub, { color: c.textFaint }]} numberOfLines={1}>{sub}</Text>}
      {progress != null ? (
        <View style={[styles.progressTrack, { backgroundColor: c.progTrack }]}>
          <View style={[styles.progressFill, { backgroundColor: c.accent, width: `${Math.min(100, Math.max(0, progress * 100))}%` }]} />
        </View>
      ) : (
        <View style={{ marginTop: 8, alignItems: 'flex-start' }}><WaveLine color={c.accent} /></View>
      )}
    </Pressable>
  );
}

function GoalMiniCard({ icon, label, value, progress, c, testID, onPress }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string; value: string; progress: number; c: HomeColors; testID?: string; onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.goalMini, { backgroundColor: c.cardBg2, borderColor: c.border }]} testID={testID}>
      <View style={[styles.goalMiniIcon, { backgroundColor: c.accentSoft }]}>
        <Ionicons name={icon} size={16} color={c.accent} />
      </View>
      <Text style={[styles.goalMiniLabel, { color: c.textSec }]} numberOfLines={1}>{label}</Text>
      <Text style={[styles.goalMiniValue, { color: c.text }]} numberOfLines={1}>{value}</Text>
      <View style={[styles.progressTrack, { backgroundColor: c.progTrack }]}>
        <View style={[styles.progressFill, { backgroundColor: c.accent, width: `${Math.min(100, Math.max(0, progress * 100))}%` }]} />
      </View>
    </Pressable>
  );
}

export default function Home() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const { state, today, setSteps, resetToday, getStreak } = useStore();
  const t0 = today();
  const [confirmReset, setConfirmReset] = useState(false);

  const appearance = state.settings.homeAppearance || 'dark';
  const c = buildColors(theme, appearance);

  const openDetail = (route: string) => {
    trackInteraction();
    maybeShowInterstitial(`open:${route}`);
    router.push(route as any);
  };

  useEffect(() => {
    if (Platform.OS === 'android') return;
    let sub: any;
    let baseline = 0;
    const base0 = t0.steps;
    (async () => {
      try {
        const avail = await Pedometer.isAvailableAsync();
        if (!avail) return;
        sub = Pedometer.watchStepCount((r) => {
          if (baseline === 0) baseline = r.steps;
          const delta = r.steps - baseline;
          setSteps(base0 + Math.max(0, delta));
        });
      } catch {}
    })();
    return () => { sub && sub.remove && sub.remove(); };
  }, []);

  const week = last7Days(state.days);
  const dayIdx = (dateStr: string) => (new Date(dateStr).getDay() + 6) % 7;
  const monToSun = [0, 0, 0, 0, 0, 0, 0];
  week.forEach((d) => { monToSun[dayIdx(d.date)] = d.steps; });

  const prev: number[] = [];
  const dref = new Date();
  for (let i = 13; i >= 7; i--) {
    const dt = new Date(dref); dt.setDate(dref.getDate() - i);
    const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    prev.push(state.days[k]?.steps || 0);
  }
  while (prev.length < 7) prev.push(0);
  const prev7 = prev.slice(0, 7);

  const weekTotal = monToSun.reduce((a, b) => a + b, 0);
  const weeklyAvg = Math.round(weekTotal / 7);
  const prevAvg = Math.round(prev7.reduce((a, b) => a + b, 0) / 7);
  const changePct = prevAvg > 0 ? Math.round(((weeklyAvg - prevAvg) / prevAvg) * 100) : 0;
  const streak = getStreak();

  const stepGoal = state.settings.stepGoal;
  const stepPct = Math.min(1, t0.steps / Math.max(1, stepGoal));

  useEffect(() => {
    updateStepsWidget(t0.steps, stepGoal);
  }, [t0.steps, stepGoal]);

  const glassSize = state.settings.glassSizeMl || 250;
  const waterGlassesGoal = Math.max(1, Math.round(state.settings.waterGoalMl / glassSize));
  const waterGlasses = Math.round(t0.water / glassSize);
  const waterPct = Math.min(1, waterGlasses / waterGlassesGoal);
  const sleepHrs = Math.floor(t0.sleepMin / 60);
  const sleepMins = t0.sleepMin % 60;
  const sleepPct = Math.min(1, t0.sleepMin / (state.settings.sleepGoalHr * 60));

  const todayKey = t0.date;
  const workoutMinToday = Math.round(
    state.workouts
      .filter((w) => new Date(w.startTs).toISOString().slice(0, 10) === todayKey)
      .reduce((a, w) => a + w.durationSec, 0) / 60
  );
  const workoutGoalMin = 60;
  const workoutPct = Math.min(1, workoutMinToday / workoutGoalMin);

  const streakGlow = streak >= 7;
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!streakGlow) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [streakGlow]);
  const glowRadius = pulse.interpolate({ inputRange: [0, 1], outputRange: [4, 16] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.85] });

  const addTestSteps = () => {
    trackInteraction();
    setSteps(t0.steps + 500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="home-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatarWrap, { borderColor: c.accent }]}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color={c.accent} />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.headerHi, { color: theme.text }]}>{t('hi')}, {state.profile.name} <Text style={{ fontSize: 16 }}>👋</Text></Text>
            <Text style={[styles.headerSub, { color: theme.textMuted }]}>
              {t('welcomeBack').replace('FitFlow', '')}<Text style={{ color: c.accent, fontWeight: '800' }}>FitFlow</Text>
            </Text>
          </View>
          <Animated.View
            style={[
              styles.streakCard,
              { backgroundColor: c.streakBg, borderColor: streakGlow ? c.accent : '#242424' },
              streakGlow && { shadowColor: c.glow, shadowOpacity: glowOpacity as any, shadowRadius: glowRadius as any, shadowOffset: { width: 0, height: 0 }, elevation: 10 },
            ]}
            testID="home-streak-card"
          >
            <Ionicons name="flame" size={14} color={c.accent} />
            <View style={{ marginLeft: 6 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14, lineHeight: 15 }}>{streak}</Text>
              <Text style={{ color: '#BFBFBF', fontSize: 9, fontWeight: '600' }}>Day Streak</Text>
            </View>
          </Animated.View>
          <Pressable style={styles.headerIconBtn} testID="home-notifications-icon" onPress={() => router.push('/settings')}>
            <Ionicons name="notifications-outline" size={22} color={theme.text} />
            <View style={[styles.notifDot, { backgroundColor: c.accent }]} />
          </Pressable>
          <Pressable style={styles.headerIconBtn} testID="home-settings-icon" onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color={theme.text} />
          </Pressable>
        </View>

        {/* MAIN STEP RING CARD */}
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <View style={[styles.mainCard, { backgroundColor: c.cardBg, borderColor: c.border, shadowColor: c.glow }]} testID="home-ring-card">
            <View style={styles.mainCardHeader}>
              <View>
                <Text style={[styles.mainCardTitle, { color: c.text }]}>Daily Goal</Text>
                <Text style={styles.mainCardGoal}>
                  <Text style={{ color: c.accent, fontWeight: '900' }}>{stepGoal.toLocaleString()}</Text>
                  <Text style={{ color: c.textSec, fontWeight: '600' }}>  steps</Text>
                </Text>
              </View>
              <Pressable onPress={() => router.push('/settings/step-goal')} style={[styles.editGoalBtn, { backgroundColor: c.editBtnBg, borderColor: c.border }]} testID="home-edit-goal">
                <Ionicons name="create-outline" size={14} color={c.text} />
                <Text style={[styles.editGoalTxt, { color: c.text }]}>Edit Goal</Text>
              </Pressable>
            </View>
            <View style={{ alignItems: 'center', marginTop: 6 }}>
              <BigStepRing steps={t0.steps} goal={stepGoal} c={c} />
            </View>
          </View>
        </View>

        {/* FOUR STAT CARDS */}
        <View style={styles.statsRow} testID="home-stats-row">
          <StatCardLight icon="flame" label="Calories Burned" value={`${t0.caloriesBurned}`} sub="kcal" c={c} testID="stat-calories" onPress={() => openDetail('/detail/calories')} />
          <StatCardLight icon="location" label="Distance Walked" value={t0.distanceKm.toFixed(2)} sub="km" c={c} testID="stat-distance" onPress={() => openDetail('/detail/distance')} />
          <StatCardLight icon="water" label="Hydration Tracker" value={`${waterGlasses} / ${waterGlassesGoal}`} sub="Glasses" progress={waterPct} c={c} testID="stat-hydration" onPress={() => openDetail('/detail/hydration')} />
          <StatCardLight icon="moon" label="Sleep Tracker" value={sleepHrs > 0 ? `${sleepHrs}h ${sleepMins}m` : `${sleepMins}m`} progress={sleepPct} c={c} testID="stat-sleep" onPress={() => openDetail('/detail/sleep')} />
        </View>

        {/* WEEKLY PROGRESS */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <View style={[styles.weeklyCard, { backgroundColor: c.cardBg, borderColor: c.border, shadowColor: c.glow }]} testID="home-weekly-card">
            <View style={styles.weeklyHeader}>
              <Text style={[styles.weeklyTitle, { color: c.text }]}>Weekly Progress</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.weeklyAvgLbl, { color: c.textSec }]}>Weekly Avg: </Text>
                <Text style={[styles.weeklyAvgVal, { color: c.text }]}>{weeklyAvg.toLocaleString()}</Text>
                {changePct !== 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6 }}>
                    <Ionicons name={changePct >= 0 ? 'arrow-up' : 'arrow-down'} size={11} color={c.accent} />
                    <Text style={[styles.weeklyChange, { color: c.accent }]}>{Math.abs(changePct)}%</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.weeklySubRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: c.accent }]} />
                <Text style={[styles.legendLblActive, { color: c.text }]}>This Week</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: c.prevLine }]} />
                <Text style={[styles.legendLbl, { color: c.textSec }]}>Last Week</Text>
              </View>
              <View style={{ flex: 1 }} />
              <View style={[styles.bestDayChip, { backgroundColor: c.accentSoft, borderColor: c.border }]}>
                <Text style={[styles.bestDayTxt, { color: c.accent }]}>Best Day</Text>
              </View>
            </View>
            <View style={{ alignItems: 'center', marginTop: 4 }}>
              <WeeklyChart current={monToSun} previous={prev7} c={c} />
            </View>
          </View>
        </View>

        {/* DAILY GOALS */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <View style={[styles.dailyGoalsCard, { backgroundColor: c.cardBg, borderColor: c.border, shadowColor: c.glow }]} testID="home-daily-goals-card">
            <View style={styles.dailyHeaderRow}>
              <Text style={[styles.weeklyTitle, { color: c.text }]}>Daily Goals</Text>
              <Pressable onPress={() => router.push('/(tabs)/habits')} style={{ flexDirection: 'row', alignItems: 'center' }} testID="home-view-all">
                <Text style={{ color: c.accent, fontWeight: '800', fontSize: 12 }}>View All</Text>
                <Ionicons name="chevron-forward" size={14} color={c.accent} />
              </Pressable>
            </View>
            <View style={styles.goalsRow}>
              <GoalMiniCard icon="water" label="Water Goal" value={`${waterGlasses} / ${waterGlassesGoal}`} progress={waterPct} c={c} testID="goal-water" onPress={() => router.push('/detail/hydration')} />
              <GoalMiniCard icon="moon" label="Sleep Goal" value={`${sleepHrs}h ${sleepMins}m / ${state.settings.sleepGoalHr}h`} progress={sleepPct} c={c} testID="goal-sleep" onPress={() => router.push('/detail/sleep')} />
              <GoalMiniCard icon="barbell" label="Workout Goal" value={`${workoutMinToday} / ${workoutGoalMin} min`} progress={workoutPct} c={c} testID="goal-workout" onPress={() => router.push('/(tabs)/workout')} />
              <GoalMiniCard icon="footsteps" label="Steps Goal" value={`${t0.steps.toLocaleString()} / ${(stepGoal / 1000).toFixed(0)}K`} progress={stepPct} c={c} testID="goal-step" onPress={() => router.push('/(tabs)/steps')} />
            </View>
          </View>
        </View>

        {/* NATIVE AD */}
        <View style={{ marginTop: 14 }}>
          <NativeAdSlot refreshMs={300000} />
        </View>

        {/* Reset button */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Pressable onPress={() => setConfirmReset(true)} testID="home-reset-button" style={[styles.resetBtn, { borderColor: theme.danger + '55' }]}>
            <Ionicons name="refresh" size={16} color={theme.danger} />
            <Text style={{ color: theme.danger, marginLeft: 8, fontWeight: '700' }}>{t('resetToday')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* BANNER AD (BOTTOM FIXED) */}
      <View style={styles.bannerWrap}>
        <BannerAdSlot />
      </View>

      {/* Live Steps Demo floating button */}
      <Pressable
        onPress={addTestSteps}
        style={[styles.fab, { backgroundColor: c.accent, shadowColor: c.glow }]}
        testID="home-add-steps-fab"
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.fabTxt}>500 Steps</Text>
      </Pressable>

      <Sheet visible={confirmReset} onClose={() => setConfirmReset(false)} title={t('resetTitle')}>
        <Text style={{ color: theme.textMuted, marginBottom: 20 }}>{t('resetBody')}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}><PillButton label={t('cancel')} onPress={() => setConfirmReset(false)} variant="ghost" testID="reset-cancel" /></View>
          <View style={{ flex: 1 }}><PillButton label={t('reset')} onPress={() => { resetToday(); setConfirmReset(false); }} variant="danger" testID="reset-confirm" /></View>
        </View>
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, gap: 6 },
  avatarWrap: { width: 46, height: 46, borderRadius: 23, padding: 2, borderWidth: 2 },
  avatar: { flex: 1, borderRadius: 21, backgroundColor: '#2A2A2A', alignItems: 'center', justifyContent: 'center' },
  headerHi: { fontSize: 17, fontWeight: '800' },
  headerSub: { fontSize: 11, marginTop: 1 },
  streakCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, marginRight: 4 },
  headerIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4 },

  mainCard: { borderRadius: 28, padding: 18, borderWidth: 1, shadowOpacity: 0.5, shadowRadius: 24, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
  mainCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mainCardTitle: { fontSize: 18, fontWeight: '900' },
  mainCardGoal: { fontSize: 14, marginTop: 2 },
  editGoalBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  editGoalTxt: { marginLeft: 6, fontWeight: '700', fontSize: 12 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 12, marginTop: 14, gap: 8 },
  statCard: { flex: 1, borderRadius: 18, padding: 10, minHeight: 116, borderWidth: 1, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  statIconWrap: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 6, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 },
  statLabel: { fontSize: 10, fontWeight: '700' },
  statValue: { fontSize: 18, fontWeight: '900', marginTop: 2 },
  statSub: { fontSize: 10, marginTop: 1, fontWeight: '600' },
  progressTrack: { marginTop: 8, height: 4, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  weeklyCard: { borderRadius: 24, padding: 14, borderWidth: 1, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  weeklyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weeklyTitle: { fontSize: 16, fontWeight: '900' },
  weeklyAvgLbl: { fontSize: 11, fontWeight: '600' },
  weeklyAvgVal: { fontSize: 12, fontWeight: '900' },
  weeklyChange: { fontSize: 11, fontWeight: '800', marginLeft: 1 },
  weeklySubRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendLbl: { fontSize: 11, fontWeight: '600' },
  legendLblActive: { fontSize: 11, fontWeight: '700' },
  bestDayChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, borderWidth: 1 },
  bestDayTxt: { fontSize: 10, fontWeight: '800' },

  dailyGoalsCard: { borderRadius: 24, padding: 14, borderWidth: 1, shadowOpacity: 0.22, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  dailyHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  goalsRow: { flexDirection: 'row', gap: 8 },
  goalMini: { flex: 1, borderRadius: 14, padding: 10, minHeight: 96, borderWidth: 1 },
  goalMiniIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
  goalMiniLabel: { fontSize: 10, fontWeight: '700' },
  goalMiniValue: { fontSize: 12, fontWeight: '900', marginTop: 2 },

  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 999, borderWidth: 1 },

  bannerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 999,
    shadowOpacity: 0.6,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  fabTxt: { color: '#FFFFFF', fontWeight: '800', fontSize: 13, marginLeft: 4 },
});
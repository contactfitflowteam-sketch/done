import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pedometer } from 'expo-sensors';
import Svg, { Circle, Defs, LinearGradient, Stop, Path, Line as SvgLine, Text as SvgText, G } from 'react-native-svg';

import { useTheme } from '@/src/theme';
import { useStore, last7Days } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { Sheet, PillButton, AdBanner, NativeAdCard } from '@/src/components/ui';
import { trackInteraction, maybeShowInterstitial } from '@/src/ads/manager';

// -------- Dark-theme palette used on the Home screen (matches reference image #1 – premium black + orange glow) --------
const L = {
  cardBg: '#101010',        // deep glass card
  cardBg2: '#161616',
  cardShadow: '#FF7A00',
  textPrimary: '#FFFFFF',
  textSecondary: '#B8B8B8',
  textFaint: '#6B6B6B',
  divider: '#1E1E1E',
  ringTrackWhite: '#FFFFFF',
  streakChipBg: '#171717',
  streakChipText: '#FFFFFF',
  navBg: '#0C0C0C',
  cardBorder: 'rgba(255,122,0,0.22)',
};

const ORANGE = '#FF7A00';
const ORANGE_SOFT = 'rgba(255,122,0,0.16)';

// -------- Big Step Ring (white track + orange progress) --------
function BigStepRing({ steps, goal, size = 220 }: { steps: number; goal: number; size?: number }) {
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, steps / Math.max(1, goal));
  const dash = c * pct;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGradHome" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={ORANGE} />
            <Stop offset="100%" stopColor="#FF9A2F" />
          </LinearGradient>
        </Defs>
        {/* White track (matches reference #1: white unfilled + orange progress) */}
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#FFFFFF" strokeWidth={stroke} fill="none" />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGradHome)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash}, ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Ionicons name="footsteps" size={22} color={ORANGE} style={{ marginBottom: 6 }} />
        <Text style={{ color: L.textPrimary, fontSize: 40, fontWeight: '900', letterSpacing: -1.5 }}>
          {steps.toLocaleString()}
        </Text>
        <Text style={{ color: L.textSecondary, fontSize: 13, marginTop: 2 }}>Steps</Text>
        <View style={{ marginTop: 8, backgroundColor: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,122,0,0.4)' }}>
          <Text style={{ color: ORANGE, fontSize: 11, fontWeight: '800' }}>{Math.round(pct * 100)}% Complete</Text>
        </View>
      </View>
    </View>
  );
}

// -------- Small wave decoration for calories/distance cards --------
function WaveLine({ color = ORANGE }: { color?: string }) {
  return (
    <Svg width={90} height={16} viewBox="0 0 90 16">
      <Path d="M 0 8 Q 11 0, 22 8 T 45 8 T 68 8 T 90 8" stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

// -------- Weekly Line Chart (2 series) --------
function WeeklyChart({ current, previous, height = 170 }: { current: number[]; previous: number[]; height?: number }) {
  const W = 320;
  const padL = 30, padR = 10, padT = 10, padB = 24;
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = Math.max(15000, ...current, ...previous);
  const yTicks = [0, 5000, 10000, 15000];
  const xFor = (i: number, n: number) => padL + (i * (W - padL - padR)) / Math.max(1, n - 1);
  const yFor = (v: number) => padT + (1 - v / max) * (height - padT - padB);

  const path = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i, arr.length)} ${yFor(v)}`).join(' ');

  return (
    <View>
      <Svg width={W} height={height}>
        {/* Grid lines + Y labels */}
        {yTicks.map((v) => (
          <G key={v}>
            <SvgLine x1={padL} x2={W - padR} y1={yFor(v)} y2={yFor(v)} stroke="#242424" strokeWidth={1} />
            <SvgText x={padL - 6} y={yFor(v) + 4} fontSize={10} fill={L.textFaint} textAnchor="end">
              {v === 0 ? '0' : `${v / 1000}K`}
            </SvgText>
          </G>
        ))}
        {/* Previous week (grey) */}
        <Path d={path(previous)} stroke="#C9C6BE" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {previous.map((v, i) => (
          <Circle key={'p' + i} cx={xFor(i, previous.length)} cy={yFor(v)} r={3} fill="#C9C6BE" />
        ))}
        {/* Current week (orange) */}
        <Path d={path(current)} stroke={ORANGE} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {current.map((v, i) => {
          const isLast = i === current.length - 1;
          return (
            <G key={'c' + i}>
              {isLast && <Circle cx={xFor(i, current.length)} cy={yFor(v)} r={7} fill="#FFFFFF" stroke={ORANGE} strokeWidth={3} />}
              {!isLast && <Circle cx={xFor(i, current.length)} cy={yFor(v)} r={3.5} fill={ORANGE} />}
            </G>
          );
        })}
        {/* X labels */}
        {labels.map((lbl, i) => (
          <SvgText key={lbl} x={xFor(i, labels.length)} y={height - 6} fontSize={11} fill={L.textSecondary} textAnchor="middle">
            {lbl}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

// -------- Stat card (light) --------
function StatCardLight({ icon, label, value, sub, progress, testID, onPress }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  sub?: string;
  progress?: number;
  testID?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.statCard} testID={testID}>
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={16} color={ORANGE} />
      </View>
      <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
      {!!sub && <Text style={styles.statSub} numberOfLines={1}>{sub}</Text>}
      {progress != null ? (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progress * 100))}%` }]} />
        </View>
      ) : (
        <View style={{ marginTop: 8, alignItems: 'flex-start' }}><WaveLine /></View>
      )}
    </Pressable>
  );
}

// -------- Daily-goal mini card --------
function GoalMiniCard({ icon, label, value, progress, testID, onPress }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  progress: number;
  testID?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.goalMini} testID={testID}>
      <View style={styles.goalMiniIcon}>
        <Ionicons name={icon} size={16} color={ORANGE} />
      </View>
      <Text style={styles.goalMiniLabel} numberOfLines={1}>{label}</Text>
      <Text style={styles.goalMiniValue} numberOfLines={1}>{value}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progress * 100))}%` }]} />
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

  const openDetail = (route: string) => {
    trackInteraction();
    maybeShowInterstitial(`open:${route}`);
    router.push(route as any);
  };

  // Real pedometer subscription (unchanged tracking logic)
  useEffect(() => {
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
  }, []); // eslint-disable-line

  const week = last7Days(state.days);
  // Reorder to Mon..Sun for chart labels
  const dayIdx = (dateStr: string) => {
    const d = new Date(dateStr).getDay(); // 0=Sun ... 6=Sat
    return (d + 6) % 7; // Mon=0 ... Sun=6
  };
  const monToSun = [0, 0, 0, 0, 0, 0, 0];
  week.forEach((d) => { monToSun[dayIdx(d.date)] = d.steps; });

  // Previous week for comparison
  const prev: number[] = [];
  const dref = new Date();
  for (let i = 13; i >= 7; i--) {
    const dt = new Date(dref); dt.setDate(dref.getDate() - i);
    const k = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    prev.push(state.days[k]?.steps || 0);
  }
  // ensure prev length = 7 aligned Mon..Sun (approx: use as-is)
  while (prev.length < 7) prev.push(0);
  const prev7 = prev.slice(0, 7);

  const weekTotal = monToSun.reduce((a, b) => a + b, 0);
  const weeklyAvg = Math.round(weekTotal / 7);
  const prevAvg = Math.round(prev7.reduce((a, b) => a + b, 0) / 7);
  const changePct = prevAvg > 0 ? Math.round(((weeklyAvg - prevAvg) / prevAvg) * 100) : 0;
  const streak = getStreak();

  // Derived values
  const stepGoal = state.settings.stepGoal;
  const stepPct = Math.min(1, t0.steps / Math.max(1, stepGoal));
  const glassSize = state.settings.glassSizeMl || 250;
  const waterGlassesGoal = Math.max(1, Math.round(state.settings.waterGoalMl / glassSize));
  const waterGlasses = Math.round(t0.water / glassSize);
  const waterPct = Math.min(1, waterGlasses / waterGlassesGoal);
  const sleepHrs = Math.floor(t0.sleepMin / 60);
  const sleepMins = t0.sleepMin % 60;
  const sleepPct = Math.min(1, t0.sleepMin / (state.settings.sleepGoalHr * 60));

  // Workout goal: total workout duration today (mins) / 60min target
  const todayKey = t0.date;
  const workoutMinToday = Math.round(
    state.workouts
      .filter((w) => new Date(w.startTs).toISOString().slice(0, 10) === todayKey)
      .reduce((a, w) => a + w.durationSec, 0) / 60
  );
  const workoutGoalMin = 60;
  const workoutPct = Math.min(1, workoutMinToday / workoutGoalMin);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="home-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color={ORANGE} />
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerHi}>{t('hi')}, {state.profile.name} <Text style={{ fontSize: 16 }}>👋</Text></Text>
            <Text style={styles.headerSub}>
              {t('welcomeBack').replace('FitFlow', '')}<Text style={{ color: ORANGE, fontWeight: '800' }}>FitFlow</Text>
            </Text>
          </View>
          <View style={styles.streakCard} testID="home-streak-card">
            <Ionicons name="flame" size={14} color={ORANGE} />
            <View style={{ marginLeft: 6 }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14, lineHeight: 15 }}>{streak}</Text>
              <Text style={{ color: '#BFBFBF', fontSize: 9, fontWeight: '600' }}>Day Streak</Text>
            </View>
          </View>
          <Pressable style={styles.headerIconBtn} testID="home-notifications-icon" onPress={() => router.push('/settings')}>
            <Ionicons name="notifications-outline" size={22} color={theme.text} />
            <View style={styles.notifDot} />
          </Pressable>
          <Pressable style={styles.headerIconBtn} testID="home-settings-icon" onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color={theme.text} />
          </Pressable>
        </View>

        {/* MAIN STEP RING CARD (light) */}
        <View style={{ paddingHorizontal: 16, marginTop: 4 }}>
          <View style={styles.mainCard} testID="home-ring-card">
            <View style={styles.mainCardHeader}>
              <View>
                <Text style={styles.mainCardTitle}>Daily Goal</Text>
                <Text style={styles.mainCardGoal}>
                  <Text style={{ color: ORANGE, fontWeight: '900' }}>{stepGoal.toLocaleString()}</Text>
                  <Text style={{ color: L.textSecondary, fontWeight: '600' }}>  steps</Text>
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/settings/step-goal')}
                style={styles.editGoalBtn}
                testID="home-edit-goal"
              >
                <Ionicons name="create-outline" size={14} color={L.textPrimary} />
                <Text style={styles.editGoalTxt}>Edit Goal</Text>
              </Pressable>
            </View>
            <View style={{ alignItems: 'center', marginTop: 6 }}>
              <BigStepRing steps={t0.steps} goal={stepGoal} />
            </View>
          </View>
        </View>

        {/* FOUR STAT CARDS in ONE row */}
        <View style={styles.statsRow} testID="home-stats-row">
          <StatCardLight
            icon="flame"
            label="Calories Burned"
            value={`${t0.caloriesBurned}`}
            sub="kcal"
            testID="stat-calories"
            onPress={() => openDetail('/detail/calories')}
          />
          <StatCardLight
            icon="location"
            label="Distance Walked"
            value={t0.distanceKm.toFixed(2)}
            sub="km"
            testID="stat-distance"
            onPress={() => openDetail('/detail/distance')}
          />
          <StatCardLight
            icon="water"
            label="Hydration Tracker"
            value={`${waterGlasses} / ${waterGlassesGoal}`}
            sub="Glasses"
            progress={waterPct}
            testID="stat-hydration"
            onPress={() => openDetail('/detail/hydration')}
          />
          <StatCardLight
            icon="moon"
            label="Sleep Tracker"
            value={sleepHrs > 0 ? `${sleepHrs}h ${sleepMins}m` : `${sleepMins}m`}
            progress={sleepPct}
            testID="stat-sleep"
            onPress={() => openDetail('/detail/sleep')}
          />
        </View>

        {/* WEEKLY PROGRESS card */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <View style={styles.weeklyCard} testID="home-weekly-card">
            <View style={styles.weeklyHeader}>
              <Text style={styles.weeklyTitle}>Weekly Progress</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.weeklyAvgLbl}>Weekly Avg: </Text>
                <Text style={styles.weeklyAvgVal}>{weeklyAvg.toLocaleString()}</Text>
                {changePct !== 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6 }}>
                    <Ionicons name={changePct >= 0 ? 'arrow-up' : 'arrow-down'} size={11} color={ORANGE} />
                    <Text style={styles.weeklyChange}>{Math.abs(changePct)}%</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.weeklySubRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: ORANGE }]} />
                <Text style={styles.legendLblActive}>This Week</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#C9C6BE' }]} />
                <Text style={styles.legendLbl}>Last Week</Text>
              </View>
              <View style={{ flex: 1 }} />
              <View style={styles.bestDayChip}>
                <Text style={styles.bestDayTxt}>Best Day</Text>
              </View>
            </View>
            <View style={{ alignItems: 'center', marginTop: 4 }}>
              <WeeklyChart current={monToSun} previous={prev7} />
            </View>
          </View>
        </View>

        {/* DAILY GOALS section */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <View style={styles.dailyGoalsCard} testID="home-daily-goals-card">
            <View style={styles.dailyHeaderRow}>
              <Text style={styles.weeklyTitle}>Daily Goals</Text>
              <Pressable onPress={() => router.push('/(tabs)/habits')} style={{ flexDirection: 'row', alignItems: 'center' }} testID="home-view-all">
                <Text style={{ color: ORANGE, fontWeight: '800', fontSize: 12 }}>View All</Text>
                <Ionicons name="chevron-forward" size={14} color={ORANGE} />
              </Pressable>
            </View>
            <View style={styles.goalsRow}>
              <GoalMiniCard
                icon="water"
                label="Water Goal"
                value={`${waterGlasses} / ${waterGlassesGoal}`}
                progress={waterPct}
                testID="goal-water"
                onPress={() => router.push('/detail/hydration')}
              />
              <GoalMiniCard
                icon="moon"
                label="Sleep Goal"
                value={`${sleepHrs}h ${sleepMins}m / ${state.settings.sleepGoalHr}h`}
                progress={sleepPct}
                testID="goal-sleep"
                onPress={() => router.push('/detail/sleep')}
              />
              <GoalMiniCard
                icon="barbell"
                label="Workout Goal"
                value={`${workoutMinToday} / ${workoutGoalMin} min`}
                progress={workoutPct}
                testID="goal-workout"
                onPress={() => router.push('/(tabs)/workout')}
              />
              <GoalMiniCard
                icon="footsteps"
                label="Steps Goal"
                value={`${t0.steps.toLocaleString()} / ${(stepGoal / 1000).toFixed(0)}K`}
                progress={stepPct}
                testID="goal-step"
                onPress={() => router.push('/(tabs)/steps')}
              />
            </View>
          </View>
        </View>

        {/* Ads (preserved) */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <NativeAdCard testID="home-native-ad" />
        </View>
        <AdBanner />

        {/* Reset button (preserved) */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Pressable onPress={() => setConfirmReset(true)} testID="home-reset-button" style={[styles.resetBtn, { borderColor: theme.danger + '55' }]}>
            <Ionicons name="refresh" size={16} color={theme.danger} />
            <Text style={{ color: theme.danger, marginLeft: 8, fontWeight: '700' }}>{t('resetToday')}</Text>
          </Pressable>
        </View>
      </ScrollView>

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
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    padding: 2,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  avatar: {
    flex: 1,
    borderRadius: 21,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerHi: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  headerSub: { color: '#B8B8B8', fontSize: 11, marginTop: 1 },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: L.streakChipBg,
    borderWidth: 1,
    borderColor: '#242424',
    marginRight: 4,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: ORANGE,
  },

  // Main card
  mainCard: {
    backgroundColor: L.cardBg,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: L.cardBorder,
    shadowColor: ORANGE,
    shadowOpacity: 0.55,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 8 },
    elevation: 14,
  },
  mainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mainCardTitle: { color: L.textPrimary, fontSize: 18, fontWeight: '900' },
  mainCardGoal: { fontSize: 14, marginTop: 2 },
  editGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B1B1B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: L.cardBorder,
  },
  editGoalTxt: { color: L.textPrimary, marginLeft: 6, fontWeight: '700', fontSize: 12 },

  // Stat row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginTop: 14,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: L.cardBg,
    borderRadius: 18,
    padding: 10,
    minHeight: 116,
    borderWidth: 1,
    borderColor: L.cardBorder,
    shadowColor: ORANGE,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: ORANGE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: ORANGE,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  statLabel: { color: L.textSecondary, fontSize: 10, fontWeight: '700' },
  statValue: { color: L.textPrimary, fontSize: 18, fontWeight: '900', marginTop: 2 },
  statSub: { color: L.textFaint, fontSize: 10, marginTop: 1, fontWeight: '600' },
  progressTrack: {
    marginTop: 8,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#242424',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ORANGE,
    borderRadius: 3,
  },

  // Weekly card
  weeklyCard: {
    backgroundColor: L.cardBg,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: L.cardBorder,
    shadowColor: ORANGE,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyTitle: { color: L.textPrimary, fontSize: 16, fontWeight: '900' },
  weeklyAvgLbl: { color: L.textSecondary, fontSize: 11, fontWeight: '600' },
  weeklyAvgVal: { color: L.textPrimary, fontSize: 12, fontWeight: '900' },
  weeklyChange: { color: ORANGE, fontSize: 11, fontWeight: '800', marginLeft: 1 },
  weeklySubRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  legendLbl: { color: L.textSecondary, fontSize: 11, fontWeight: '600' },
  legendLblActive: { color: L.textPrimary, fontSize: 11, fontWeight: '700' },
  bestDayChip: {
    backgroundColor: ORANGE_SOFT,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: L.cardBorder,
  },
  bestDayTxt: { color: ORANGE, fontSize: 10, fontWeight: '800' },

  // Daily goals
  dailyGoalsCard: {
    backgroundColor: L.cardBg,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: L.cardBorder,
    shadowColor: ORANGE,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  dailyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  goalMini: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    borderRadius: 14,
    padding: 10,
    minHeight: 96,
    borderWidth: 1,
    borderColor: L.cardBorder,
  },
  goalMiniIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ORANGE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  goalMiniLabel: { color: L.textSecondary, fontSize: 10, fontWeight: '700' },
  goalMiniValue: { color: L.textPrimary, fontSize: 12, fontWeight: '900', marginTop: 2 },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
});

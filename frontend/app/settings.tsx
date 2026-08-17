import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Application from 'expo-application';
import { useTheme, THEMES, ThemeName } from '@/src/theme';
import { useStore } from '@/src/store';
import { useI18n, LANGUAGES } from '@/src/i18n';
import { ScreenHeader, GlassCard, Row, Sheet, PillButton } from '@/src/components/ui';
import { APP_LINKS } from '@/src/ads/config';

export default function Settings() {
  const { theme, themeName, setTheme } = useTheme();
  const { t, lang } = useI18n();
  const { state, saveSettings, resetToday, resetAll } = useStore();
  const router = useRouter();
  const [confirmAll, setConfirmAll] = useState(false);
  const [confirmToday, setConfirmToday] = useState(false);

  const s = state.settings;
  const toggle = (k: keyof typeof s) => saveSettings({ [k]: !s[k] } as any);
  const currentLang = LANGUAGES.find((l) => l.code === lang);

  const openLink = async (url: string) => {
    try { await Linking.openURL(url); } catch {}
  };

  const Section = ({ title, children }: any) => (
    <View style={{ marginTop: 20 }}>
      <Text style={{ color: theme.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, marginLeft: 4, marginBottom: 8 }}>{title}</Text>
      <GlassCard style={{ padding: 0, paddingHorizontal: 14 }}>{children}</GlassCard>
    </View>
  );

  const ThemeSwatchRow = () => (
    <View style={{ paddingVertical: 14 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 12 }}>
        {(Object.keys(THEMES) as ThemeName[]).map((n) => {
          const p = THEMES[n];
          const on = n === themeName;
          return (
            <Pressable key={n} onPress={() => setTheme(n)} testID={`theme-${n}`} style={{ alignItems: 'center', flexShrink: 0 }}>
              <View style={[styles.swatch, { backgroundColor: p.primary, borderColor: on ? theme.text : 'transparent', shadowColor: p.glow }]} />
              <Text style={{ color: on ? theme.primary : theme.textMuted, fontSize: 11, marginTop: 6, fontWeight: '700' }}>{p.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  const Toggle = ({ v }: { v: boolean }) => (
    <View style={[styles.tog, { backgroundColor: v ? theme.primary : theme.divider }]}>
      <View style={[styles.togBall, { alignSelf: v ? 'flex-end' : 'flex-start' }]} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="settings-screen">
      <ScreenHeader title={t('settings')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        <Section title={t('general')}>
          <Row icon="language" label={t('changeLanguage')} value={`${currentLang?.flag} ${currentLang?.native}`} onPress={() => router.push('/language')} testID="settings-language" />
        </Section>

        <Section title={t('personal')}>
          <Row icon="person" label={t('profile')} value={state.profile.name} onPress={() => router.push('/settings/profile')} testID="settings-profile" />
          <Row icon="male-female" label={t('gender')} value={state.profile.gender} onPress={() => router.push('/(tabs)/body')} testID="settings-gender" />
          <Row icon="calendar" label={t('birthYear')} value={String(state.profile.birthYear)} onPress={() => router.push('/(tabs)/body')} testID="settings-birth" />
          <Row icon="scale" label={t('weight')} value={`${state.profile.weightKg} ${s.weightUnit}`} onPress={() => router.push('/(tabs)/body')} testID="settings-weight" />
          <Row icon="resize" label={t('height')} value={`${state.profile.heightCm} ${s.heightUnit}`} onPress={() => router.push('/(tabs)/body')} testID="settings-height" />
        </Section>

        <Section title={t('activity')}>
          <Row icon="walk" label={t('stepGoal')} value={s.stepGoal.toLocaleString()} onPress={() => router.push('/settings/step-goal')} testID="settings-stepgoal" />
          <Row icon="footsteps" label={t('stepLength')} value={state.profile.stepLengthCm === 'auto' ? t('auto') : `${(state.profile.stepLengthCm as number).toFixed(0)} cm`} onPress={() => router.push('/(tabs)/body')} testID="settings-steplen" />
          <Row icon="map" label={t('distanceUnit')} value={s.distanceUnit} onPress={() => saveSettings({ distanceUnit: s.distanceUnit === 'km' ? 'mi' : 'km' })} testID="settings-distunit" />
          <Row icon="flame" label={t('calorieSettings')} value={t('auto')} onPress={() => {}} testID="settings-cal" />
        </Section>

        <Section title={t('hydration')}>
          <Row icon="water" label={t('waterGoal')} value={`${s.waterGoalMl / 1000} L`} onPress={() => router.push('/settings/water-goal')} testID="settings-watergoal" />
          <Row icon="beaker" label={t('glassSize')} value={`${s.glassSizeMl} ml`} onPress={() => router.push('/settings/water-goal')} testID="settings-glass" />
          <Row icon="notifications" label={t('waterReminders')} right={<Toggle v={s.notifWater} />} onPress={() => toggle('notifWater')} testID="settings-water-remind" />
        </Section>

        <Section title={t('sleep')}>
          <Row icon="moon" label={t('sleepGoal')} value={`${s.sleepGoalHr}h`} onPress={() => router.push('/settings/sleep-goal')} testID="settings-sleepgoal" />
          <Row icon="bed" label={t('sleepTracking')} right={<Toggle v={true} />} onPress={() => {}} testID="settings-sleeptrack" />
        </Section>

        <Section title={t('notifications')}>
          <Row icon="walk" label={t('dailyStepReminder')} right={<Toggle v={s.notifSteps} />} onPress={() => toggle('notifSteps')} testID="settings-notif-steps" />
          <Row icon="water" label={t('waterReminder')} right={<Toggle v={s.notifWater} />} onPress={() => toggle('notifWater')} testID="settings-notif-water" />
          <Row icon="fitness" label={t('workoutReminder')} right={<Toggle v={s.notifWorkout} />} onPress={() => toggle('notifWorkout')} testID="settings-notif-workout" />
          <Row icon="flame" label={t('streakReminder')} right={<Toggle v={s.notifStreak} />} onPress={() => toggle('notifStreak')} testID="settings-notif-streak" />
        </Section>

        <View style={{ marginTop: 20 }}>
          <Text style={{ color: theme.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.6, marginLeft: 4, marginBottom: 8 }}>{t('appearance')}</Text>
          <GlassCard style={{ padding: 12 }}>
            <Text style={{ color: theme.text, fontWeight: '700', marginLeft: 4 }}>{t('theme')}</Text>
            <ThemeSwatchRow />
          </GlassCard>
        </View>

        <Section title={t('social')}>
          <Row icon="logo-instagram" label={t('instagram')} onPress={() => openLink(APP_LINKS.instagram)} testID="settings-instagram" />
          <Row icon="logo-twitter" label={t('twitter')} onPress={() => openLink(APP_LINKS.twitter)} testID="settings-twitter" />
          <Row icon="logo-facebook" label={t('facebook')} onPress={() => openLink(APP_LINKS.facebook)} testID="settings-facebook" />
        </Section>

        <Section title={t('app')}>
          <Row icon="star" label={t('rateApp')} onPress={() => openLink(APP_LINKS.playStore)} testID="settings-rate" />
          <Row icon="apps" label={t('homeWidget')} right={<Toggle v={s.widgetEnabled} />} onPress={() => toggle('widgetEnabled')} testID="settings-widget" />
        </Section>

        <Section title={t('data')}>
          <Row icon="refresh" label={t('resetToday')} onPress={() => setConfirmToday(true)} testID="settings-reset-today" />
          <Row icon="trash" label={t('resetAllData')} onPress={() => setConfirmAll(true)} testID="settings-reset-all" danger />
          <Row icon="download" label={t('exportData')} value="JSON" onPress={() => {}} testID="settings-export" />
        </Section>

        <Section title={t('about')}>
          <Row icon="information-circle" label={t('appVersion')} value={Application.nativeApplicationVersion || '1.0.0'} testID="settings-version" />
          <Row icon="shield" label={t('privacyPolicy')} onPress={() => router.push('/settings/privacy')} testID="settings-privacy" />
          <Row icon="document-text" label={t('terms')} onPress={() => router.push('/settings/terms')} testID="settings-terms" />
          <Row icon="mail" label={t('contact')} onPress={() => openLink(`mailto:${APP_LINKS.supportEmail}`)} testID="settings-contact" />
        </Section>
      </ScrollView>

      <Sheet visible={confirmToday} onClose={() => setConfirmToday(false)} title={t('resetTitle')}>
        <Text style={{ color: theme.textMuted, marginBottom: 20 }}>{t('resetBody')}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}><PillButton label={t('cancel')} onPress={() => setConfirmToday(false)} variant="ghost" /></View>
          <View style={{ flex: 1 }}><PillButton label={t('reset')} onPress={() => { resetToday(); setConfirmToday(false); }} variant="danger" testID="confirm-reset-today" /></View>
        </View>
      </Sheet>

      <Sheet visible={confirmAll} onClose={() => setConfirmAll(false)} title={t('resetAllTitle')}>
        <Text style={{ color: theme.textMuted, marginBottom: 20 }}>{t('resetAllBody')}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}><PillButton label={t('cancel')} onPress={() => setConfirmAll(false)} variant="ghost" /></View>
          <View style={{ flex: 1 }}><PillButton label={t('deleteAll')} onPress={() => { resetAll(); setConfirmAll(false); }} variant="danger" testID="confirm-reset-all" /></View>
        </View>
      </Sheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, shadowOpacity: 0.6, shadowRadius: 12, elevation: 6 },
  tog: { width: 44, height: 26, borderRadius: 999, padding: 3, justifyContent: 'center' },
  togBall: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Pedometer } from 'expo-sensors';

import { useTheme } from '@/src/theme';
import { useStore } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { PillButton, GlassCard } from '@/src/components/ui';
import { updateStepsWidget } from '@/src/widgets/widget-data';

type PermState = 'undetermined' | 'granted' | 'denied' | 'blocked';

const AndroidPedometer = (() => {
  if (Platform.OS !== 'android') return null;
  try { return require('expo-android-pedometer'); } catch { return null; }
})();

export default function Permissions() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { saveSettings, setSteps } = useStore();
  const router = useRouter();
  const [activity, setActivity] = useState<PermState>('undetermined');
  const [notif, setNotif] = useState<PermState>('undetermined');

  // ---- Activity / motion permission ----
  const requestActivity = async () => {
    try {
      if (activity === 'blocked') { Linking.openSettings(); return; }
      if (Platform.OS === 'android' && AndroidPedometer) {
        await AndroidPedometer.initialize();
        const res = await AndroidPedometer.requestPermissions();
        if (res?.granted) {
          setActivity('granted');
          // Start the background foreground-service immediately.
          try {
            await AndroidPedometer.setupBackgroundUpdates({
              title: 'FitFlow',
              contentTemplate: "You've walked %d steps today",
              style: 'bigText',
              iconResourceName: 'ic_launcher',
            });
          } catch {}
          try {
            const steps = await AndroidPedometer.getStepsCountAsync();
            if (typeof steps === 'number') { setSteps(steps); updateStepsWidget(steps, 15000); }
          } catch {}
        } else {
          const status = await AndroidPedometer.getActivityPermissionStatus();
          setActivity(status?.canAskAgain === false ? 'blocked' : 'denied');
        }
        return;
      }
      // iOS / fallback via expo-sensors
      const available = await Pedometer.isAvailableAsync();
      if (!available) { setActivity('denied'); return; }
      const res = await Pedometer.requestPermissionsAsync();
      setActivity(res.granted ? 'granted' : res.canAskAgain === false ? 'blocked' : 'denied');
    } catch {
      setActivity('denied');
    }
  };

  // ---- Notification permission ----
  const requestNotif = async () => {
    try {
      if (notif === 'blocked') { Linking.openSettings(); return; }
      if (Platform.OS === 'android' && AndroidPedometer) {
        const res = await AndroidPedometer.requestNotificationPermissions();
        if (res?.granted) { setNotif('granted'); return; }
        const status = await AndroidPedometer.getNotificationPermissionStatus();
        setNotif(status?.canAskAgain === false ? 'blocked' : 'denied');
        return;
      }
      const res = await Notifications.requestPermissionsAsync();
      setNotif(res.granted ? 'granted' : res.canAskAgain === false ? 'blocked' : 'denied');
    } catch {
      setNotif('denied');
    }
  };

  const finish = () => { saveSettings({ permsRequested: true }); router.replace('/(tabs)/home'); };

  const labelFor = (s: PermState) => {
    if (s === 'granted') return t('granted');
    if (s === 'blocked') return t('openSettings');
    return t('allow');
  };
  const variantFor = (s: PermState): 'primary' | 'ghost' => (s === 'granted' ? 'ghost' : 'primary');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} testID="permissions-screen">
      <View style={{ padding: 24, flex: 1, justifyContent: 'space-between' }}>
        <View>
          <View style={[styles.hero, { backgroundColor: theme.primary + '22', shadowColor: theme.glow }]}>
            <Ionicons name="shield-checkmark" size={44} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{t('motionTitle')}</Text>
          <Text style={[styles.sub, { color: theme.textMuted }]}>{t('motionSub')}</Text>

          <GlassCard style={{ marginTop: 24 }}>
            <View style={styles.permRow}>
              <View style={[styles.permIcon, { backgroundColor: theme.primary + '22' }]}>
                <Ionicons name="walk" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>{t('physicalActivity')}</Text>
                <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
                  {activity === 'blocked' ? t('permBlockedHint') : t('physicalActivitySub')}
                </Text>
              </View>
              <PillButton label={labelFor(activity)} onPress={requestActivity} variant={variantFor(activity)} testID="perm-activity-button" style={{ paddingHorizontal: 16, paddingVertical: 10 }} />
            </View>
          </GlassCard>

          <GlassCard style={{ marginTop: 12 }}>
            <View style={styles.permRow}>
              <View style={[styles.permIcon, { backgroundColor: theme.primary + '22' }]}>
                <Ionicons name="notifications" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>{t('notifications')}</Text>
                <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
                  {notif === 'blocked' ? t('permBlockedHint') : t('notificationsSub')}
                </Text>
              </View>
              <PillButton label={labelFor(notif)} onPress={requestNotif} variant={variantFor(notif)} testID="perm-notif-button" style={{ paddingHorizontal: 16, paddingVertical: 10 }} />
            </View>
          </GlassCard>
        </View>

        <PillButton label={t('continue')} onPress={finish} testID="perm-continue-button" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { width: 96, height: 96, borderRadius: 32, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 20, shadowOpacity: 0.6, shadowRadius: 24, elevation: 12 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 24, letterSpacing: -0.5 },
  sub: { fontSize: 14, textAlign: 'center', marginTop: 10, paddingHorizontal: 12, lineHeight: 20 },
  permRow: { flexDirection: 'row', alignItems: 'center' },
  permIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

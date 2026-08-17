import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Pedometer } from 'expo-sensors';

import { useTheme } from '@/src/theme';
import { useStore } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { PillButton, GlassCard } from '@/src/components/ui';

export default function Permissions() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { saveSettings } = useStore();
  const router = useRouter();
  const [activityGranted, setActivityGranted] = useState<boolean | null>(null);
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);

  const requestActivity = async () => {
    try {
      const available = await Pedometer.isAvailableAsync();
      if (!available) { setActivityGranted(false); return; }
      const res = await Pedometer.requestPermissionsAsync();
      setActivityGranted(res.granted);
    } catch { setActivityGranted(false); }
  };
  const requestNotif = async () => {
    try {
      const res = await Notifications.requestPermissionsAsync();
      setNotifGranted(res.granted);
    } catch { setNotifGranted(false); }
  };
  const finish = () => { saveSettings({ permsRequested: true }); router.replace('/(tabs)/home'); };

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
                <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>{t('physicalActivitySub')}</Text>
              </View>
              <PillButton label={activityGranted ? t('granted') : t('allow')} onPress={requestActivity} variant={activityGranted ? 'ghost' : 'primary'} testID="perm-activity-button" style={{ paddingHorizontal: 16, paddingVertical: 10 }} />
            </View>
          </GlassCard>

          <GlassCard style={{ marginTop: 12 }}>
            <View style={styles.permRow}>
              <View style={[styles.permIcon, { backgroundColor: theme.primary + '22' }]}>
                <Ionicons name="notifications" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 15 }}>{t('notifications')}</Text>
                <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>{t('notificationsSub')}</Text>
              </View>
              <PillButton label={notifGranted ? t('granted') : t('allow')} onPress={requestNotif} variant={notifGranted ? 'ghost' : 'primary'} testID="perm-notif-button" style={{ paddingHorizontal: 16, paddingVertical: 10 }} />
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

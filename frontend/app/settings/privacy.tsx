import React from 'react';
import { Text, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { useI18n } from '@/src/i18n';
import { ScreenHeader, GlassCard } from '@/src/components/ui';

const SECTIONS = [
  ['1. Information Collection and Use', 'FitFlow accesses your device\'s built-in step sensors, accelerometer, and Android Physical Activity permissions to track daily steps, calories burned, and active time locally. Profile details like age, gender, height, and weight are saved locally on your device.'],
  ['2. Third-Party Services & Advertisements', 'FitFlow uses Google AdMob to display advertisements. AdMob may collect Advertising IDs and device diagnostics in accordance with Google\'s Privacy Policy. Google Play Services are used for core app stability.'],
  ['3. Permissions Required', 'FitFlow requests ACTIVITY_RECOGNITION (for step counting), POST_NOTIFICATIONS (for daily reminders), and INTERNET / ACCESS_NETWORK_STATE (for loading Google AdMob ads).'],
  ['4. Data Storage & Security', 'All your fitness metrics, logs, and personal stats remain saved locally on your device. We do not sell, rent, or transfer your personal data to any external third party.'],
  ['5. Children\'s Privacy', 'FitFlow does not knowingly collect personally identifiable information from children under the age of 13.'],
  ['6. Changes to This Policy', 'This Privacy Policy may be updated periodically. Continued use of the app constitutes acceptance of any updates.'],
  ['7. Contact Us', 'Email: contactfitflowteam@gmail.com\nInstagram: https://www.instagram.com/fit__floww___?igsi=MXZld2U1dHo2OWc0cg==\nX (Twitter): https://x.com/fitflowkwo?s=11'],
];

export default function Privacy() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="privacy-screen">
      <ScreenHeader title={t('privacyPolicy')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <GlassCard>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800' }}>FitFlow Privacy Policy</Text>
          <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2, marginBottom: 8 }}>Effective Date: August 26, 2026</Text>
          <Text style={{ color: theme.textMuted, fontSize: 13, lineHeight: 20 }}>
            FitFlow is dedicated to protecting the privacy of our users. This policy outlines how your data is handled.
          </Text>
          {SECTIONS.map(([h, b]) => (
            <View key={h} style={{ marginTop: 14 }}>
              <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>{h}</Text>
              <Text style={{ color: theme.textMuted, fontSize: 13, lineHeight: 20, marginTop: 4 }}>{b}</Text>
            </View>
          ))}
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

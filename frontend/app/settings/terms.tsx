import React from 'react';
import { Text, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { useI18n } from '@/src/i18n';
import { ScreenHeader, GlassCard } from '@/src/components/ui';

const SECTIONS = [
  ['1. Use of the App', 'FitFlow provides daily step counting, activity tracking, water intake monitoring, and general fitness logging for personal, non-commercial use. You agree to use the app in accordance with applicable laws.'],
  ['2. Fitness & Medical Disclaimer', 'FitFlow is a lifestyle tracking utility and not a medical device. It does not provide medical diagnosis or treatment. Consult a healthcare professional before starting any fitness regimen.'],
  ['3. Accuracy & Sensor Tracking', 'Step counts, calories, distance, and hydration logs are estimations based on device hardware and sensors, which may vary across devices.'],
  ['4. Intellectual Property', 'All branding, UI designs, logos, and application code are the exclusive intellectual property of the FitFlow development team.'],
  ['5. Advertisements & Third-Party Services', 'FitFlow displays advertisements served through Google AdMob and uses Google Play Services. We are not responsible for third-party content linked via ads.'],
  ['6. Limitation of Liability', 'To the maximum extent permitted by law, FitFlow shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of the app.'],
  ['7. Governing Law', 'These terms shall be governed by and construed in accordance with the applicable laws of India.'],
  ['8. Modifications', 'We reserve the right to modify these terms at any time. Continued use of the application constitutes acceptance of updated terms.'],
  ['9. Contact Information', 'Email: contactfitflowteam@gmail.com\nInstagram: https://www.instagram.com/fit__floww___?igsi=MXZld2U1dHo2OWc0cg==\nX (Twitter): https://x.com/fitflowkwo?s=11'],
];

export default function Terms() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="terms-screen">
      <ScreenHeader title={t('terms')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <GlassCard>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800' }}>Terms & Conditions</Text>
          <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2, marginBottom: 8 }}>Effective Date: August 26, 2026</Text>
          <Text style={{ color: theme.textMuted, fontSize: 13, lineHeight: 20 }}>
            Welcome to FitFlow. By downloading, installing, or using the FitFlow mobile application, you agree to comply with and be bound by these terms.
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

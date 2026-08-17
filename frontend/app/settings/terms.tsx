import React from 'react';
import { Text, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { useI18n } from '@/src/i18n';
import { ScreenHeader, GlassCard } from '@/src/components/ui';

const SECTIONS = [
  ['1. Use of the App', 'FitFlow is intended for fitness tracking, step counting, hydration tracking, habit tracking, and wellness monitoring purposes only.'],
  ['2. Health Disclaimer', 'FitFlow does not provide medical advice. All fitness, calorie, hydration, sleep, and activity information is provided for informational purposes only.'],
  ['3. User Responsibility', 'Users are responsible for verifying fitness and health information before making health-related decisions.'],
  ['4. Accuracy', 'Step counts, calories, distance, hydration estimates, and other statistics may vary depending on device capabilities and sensor accuracy.'],
  ['5. Third-Party Services', 'FitFlow may use services such as Google AdMob and Google Play Services.'],
  ['6. Intellectual Property', 'All FitFlow branding, design elements, and application content remain the property of FitFlow.'],
  ['7. Limitation of Liability', 'FitFlow shall not be liable for any direct or indirect damages resulting from the use of the application.'],
  ['8. Updates', 'These Terms may be updated periodically.'],
  ['9. Contact', 'Email: contactfitflowteam@gmail.com\nInstagram: https://www.instagram.com/fit__floww___'],
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
          <Text style={{ color: theme.text, fontSize: 15, fontWeight: '800' }}>Terms & Conditions</Text>
          <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2, marginBottom: 8 }}>Last Updated: 2026</Text>
          <Text style={{ color: theme.textMuted, fontSize: 13, lineHeight: 20 }}>Welcome to FitFlow. By downloading, installing, or using FitFlow, you agree to these Terms & Conditions.</Text>
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

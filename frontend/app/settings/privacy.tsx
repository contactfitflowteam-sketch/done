import React from 'react';
import { Text, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { useI18n } from '@/src/i18n';
import { ScreenHeader, GlassCard } from '@/src/components/ui';

const SECTIONS = [
  ['1. Information We Collect', 'FitFlow may store: step count data, hydration records, workout records, habit tracking data, user preferences, and body measurements entered by the user.'],
  ['2. Permissions', 'FitFlow may request Physical Activity Permission and Notification Permission. These permissions are used solely to provide fitness tracking features.'],
  ['3. Data Storage', "Most data is stored locally on the user's device."],
  ['4. Advertising', "FitFlow may display advertisements through Google AdMob. Google may collect certain information according to Google's Privacy Policy."],
  ['5. Data Sharing', 'FitFlow does not sell personal information.'],
  ['6. Security', 'Reasonable measures are taken to protect user data.'],
  ['7. Children\u2019s Privacy', 'FitFlow is not intended for children under the applicable minimum age required by local laws.'],
  ['8. Your Choices', 'You may reset or delete your data from the Settings section.'],
  ['9. Changes', 'This Privacy Policy may be updated periodically.'],
  ['10. Contact', 'Email: contactfitflowteam@gmail.com\nInstagram: https://www.instagram.com/fit__floww___'],
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
          <Text style={{ color: theme.text, fontSize: 15, fontWeight: '800' }}>FitFlow Privacy Policy</Text>
          <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2, marginBottom: 8 }}>Last Updated: 2026</Text>
          <Text style={{ color: theme.textMuted, fontSize: 13, lineHeight: 20 }}>FitFlow respects your privacy.</Text>
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

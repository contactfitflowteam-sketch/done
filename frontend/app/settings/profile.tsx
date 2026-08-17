import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme';
import { useStore } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { ScreenHeader, GlassCard, PillButton } from '@/src/components/ui';

export default function Profile() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { state, saveProfile } = useStore();
  const router = useRouter();
  const [name, setName] = useState(state.profile.name);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="profile-screen">
      <ScreenHeader title={t('profile')} onBack={() => router.back()} />
      <View style={{ padding: 16 }}>
        <GlassCard>
          <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>{t('profile')}</Text>
          <TextInput value={name} onChangeText={setName} style={[styles.input, { color: theme.text, borderColor: theme.cardBorder }]} testID="profile-name-input" placeholder="Enter name" placeholderTextColor={theme.textFaint} />
        </GlassCard>
        <PillButton label={t('save')} onPress={() => { saveProfile({ name: name.trim() || 'Guest' }); router.back(); }} style={{ marginTop: 16 }} testID="profile-save" />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ input: { fontSize: 16, fontWeight: '700', padding: 12, borderRadius: 12, borderWidth: 1 } });

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/src/theme';
import { useStore } from '@/src/store';
import { useI18n, LANGUAGES, Lang } from '@/src/i18n';
import { PillButton } from '@/src/components/ui';

export default function LanguageScreen() {
  const { theme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const { state, saveSettings } = useStore();
  const router = useRouter();
  const [sel, setSel] = useState<Lang>(lang);
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (setLang) {
        await setLang(sel);
      }

      if (saveSettings) {
        await saveSettings({
          langSelected: true,
          // Language choose hote hi state sync ho jayegi
          onboarded: state.settings?.onboarded ?? false,
          permsRequested: state.settings?.permsRequested ?? false,
        });
      }

      if (!state.settings?.onboarded) {
        router.replace('/onboarding');
      } else if (!state.settings?.permsRequested) {
        router.replace('/permissions');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (e) {
      console.error('Error saving language settings:', e);
      router.replace('/onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top', 'bottom']} testID="language-screen">
      <View style={{ padding: 24, flex: 1 }}>
        <View style={[styles.hero, { backgroundColor: theme.primary + '22', shadowColor: theme.glow }]}>
          <Ionicons name="language" size={40} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{t('chooseLanguage')}</Text>
        <Text style={[styles.sub, { color: theme.textMuted }]}>{t('chooseLanguageSub')}</Text>

        <ScrollView style={{ marginTop: 24 }} showsVerticalScrollIndicator={false}>
          {LANGUAGES.map((l) => {
            const on = l.code === sel;
            return (
              <Pressable
                key={l.code}
                onPress={() => setSel(l.code)}
                testID={`lang-${l.code}`}
                style={[
                  styles.item,
                  {
                    borderColor: on ? theme.primary : theme.cardBorder,
                    backgroundColor: on ? theme.primary + '18' : theme.bgElev,
                    shadowColor: on ? theme.glow : 'transparent',
                  },
                ]}
              >
                <Text style={{ fontSize: 26 }}>{l.flag}</Text>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ color: theme.text, fontWeight: '800', fontSize: 16 }}>{l.native}</Text>
                  <Text style={{ color: theme.textMuted, fontSize: 12 }}>{l.label}</Text>
                </View>
                <View style={[styles.radio, { borderColor: on ? theme.primary : theme.textFaint }]}>
                  {on && <View style={[styles.radioDot, { backgroundColor: theme.primary }]} />}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        <PillButton
          label={submitting ? '...' : t('continue')}
          onPress={confirm}
          testID="lang-continue"
          style={{ marginTop: 16 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { width: 88, height: 88, borderRadius: 30, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 20, shadowOpacity: 0.6, shadowRadius: 22, elevation: 12 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 20, letterSpacing: -0.5 },
  sub: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12, shadowOpacity: 0.3, shadowRadius: 12, elevation: 3 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
});

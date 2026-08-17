import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import { useStore } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { GlassCard, ScreenHeader, PillButton } from '@/src/components/ui';

export default function Body() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { state, saveProfile } = useStore();
  const [p, setP] = useState(state.profile);
  const [saved, setSaved] = useState(false);

  const Picker = ({ label, options, value, onChange, testID, labelMap }: any) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {options.map((o: any) => {
          const on = value === o;
          return (
            <Pressable key={o} onPress={() => onChange(o)} testID={`${testID}-${o}`} style={[styles.opt, { borderColor: on ? theme.primary : theme.cardBorder, backgroundColor: on ? theme.primary + '22' : 'transparent' }]}>
              <Text style={{ color: on ? theme.primary : theme.text, fontWeight: '700' }}>{labelMap ? labelMap[o] : o}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const NumField = ({ label, value, unit, onChange, testID }: any) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <View style={[styles.input, { borderColor: theme.cardBorder, backgroundColor: theme.bgElev }]}>
        <TextInput value={String(value)} onChangeText={(t) => onChange(t)} keyboardType="numeric" style={{ color: theme.text, flex: 1, fontSize: 16, fontWeight: '700' }} testID={testID} />
        <Text style={{ color: theme.textMuted, fontWeight: '700' }}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']} testID="body-screen">
      <ScreenHeader title={t('bodyMeasurements')} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
        <GlassCard>
          <Picker label={t('gender')} options={['Male','Female','Other']} labelMap={{ Male: t('male'), Female: t('female'), Other: t('other') }} value={p.gender} onChange={(v: any) => setP({ ...p, gender: v })} testID="body-gender" />
          <NumField label={t('birthYear')} value={p.birthYear} unit="year" onChange={(v: string) => setP({ ...p, birthYear: parseInt(v) || p.birthYear })} testID="body-birth" />
          <NumField label={`${t('weight')} (${state.settings.weightUnit})`} value={p.weightKg} unit={state.settings.weightUnit} onChange={(v: string) => setP({ ...p, weightKg: parseFloat(v) || p.weightKg })} testID="body-weight" />
          <NumField label={`${t('height')} (${state.settings.heightUnit})`} value={p.heightCm} unit={state.settings.heightUnit} onChange={(v: string) => setP({ ...p, heightCm: parseFloat(v) || p.heightCm })} testID="body-height" />
          <Picker label={t('stepLength')} options={['auto', 'manual']} labelMap={{ auto: t('auto'), manual: t('manual') }} value={p.stepLengthCm === 'auto' ? 'auto' : 'manual'} onChange={(v: any) => setP({ ...p, stepLengthCm: v === 'auto' ? 'auto' : (p.heightCm * 0.415) })} testID="body-stepmode" />
          {p.stepLengthCm !== 'auto' && (
            <NumField label={t('stepLength')} value={p.stepLengthCm} unit="cm" onChange={(v: string) => setP({ ...p, stepLengthCm: parseFloat(v) || p.stepLengthCm })} testID="body-steplen" />
          )}
        </GlassCard>

        <PillButton label={saved ? `${t('saved')} ✓` : t('saveMeasurements')} onPress={() => { saveProfile(p); setSaved(true); setTimeout(() => setSaved(false), 1500); }} testID="body-save" style={{ marginTop: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  opt: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  input: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
});

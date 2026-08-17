import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import { useTheme } from '@/src/theme';
import { useStore } from '@/src/store';
import { useI18n } from '@/src/i18n';
import { PillButton } from '@/src/components/ui';

const { width } = Dimensions.get('window');

const SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1730051507404-b56d411199a3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMDNkJTIwZml0bmVzcyUyMHJ1bm5pbmclMjBzaG9lJTIwb3JhbmdlJTIwbmVvbnxlbnwwfHx8fDE3ODY4NTg5NDh8MA&ixlib=rb-4.1.0&q=85',
  'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMDNkJTIwZml0bmVzcyUyMHJ1bm5pbmclMjBzaG9lJTIwb3JhbmdlJTIwbmVvbnxlbnwwfHx8fDE3ODY4NTg5NDh8MA&ixlib=rb-4.1.0&q=85',
  'https://images.unsplash.com/photo-1566410824233-a8011929225c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHdhdGVyJTIwZmlsbCUyMGRyb3BzJTIwZGFya3xlbnwwfHx8fDE3ODY4NTg5NDh8MA&ixlib=rb-4.1.0&q=85',
];
const SLIDE_ICONS = ['walk', 'flame', 'trophy'] as const;

export default function Onboarding() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { saveSettings } = useStore();
  const router = useRouter();
  const [i, setI] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const SLIDES = [
    { icon: SLIDE_ICONS[0], title: t('onb1Title'), subtitle: t('onb1Sub'), img: SLIDE_IMAGES[0] },
    { icon: SLIDE_ICONS[1], title: t('onb2Title'), subtitle: t('onb2Sub'), img: SLIDE_IMAGES[1] },
    { icon: SLIDE_ICONS[2], title: t('onb3Title'), subtitle: t('onb3Sub'), img: SLIDE_IMAGES[2] },
  ];

  const finish = () => { saveSettings({ onboarded: true }); router.replace('/permissions'); };
  const next = () => {
    if (i < SLIDES.length - 1) { scrollRef.current?.scrollTo({ x: (i + 1) * width, animated: true }); setI(i + 1); }
    else finish();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} testID="onboarding-screen">
      <View style={styles.top}>
        <View style={{ flexDirection: 'row' }}>
          {SLIDES.map((_, idx) => (
            <View key={idx} style={[styles.dot, { backgroundColor: idx === i ? theme.primary : theme.divider, width: idx === i ? 24 : 8 }]} />
          ))}
        </View>
        <Pressable onPress={finish} testID="onboarding-skip">
          <Text style={{ color: theme.textMuted, fontWeight: '600' }}>{t('skip')}</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s, idx) => (
          <View key={idx} style={{ width, alignItems: 'center', paddingHorizontal: 24, justifyContent: 'space-between', paddingBottom: 40 }}>
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <View style={[styles.imgWrap, { shadowColor: theme.glow }]}>
                <Image source={{ uri: s.img }} style={styles.img} contentFit="cover" transition={400} />
                <LinearGradient colors={['transparent', theme.bg]} style={StyleSheet.absoluteFill} />
                <View style={[styles.iconOrb, { backgroundColor: theme.primary, shadowColor: theme.glow }]}>
                  <Ionicons name={s.icon} size={36} color={theme.name === 'amoled' ? '#000' : '#FFF'} />
                </View>
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.title, { color: theme.text }]}>{s.title}</Text>
              <Text style={[styles.sub, { color: theme.textMuted }]}>{s.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        <PillButton label={i === SLIDES.length - 1 ? t('getStarted') : t('next')} onPress={next} testID="onboarding-next-button" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  dot: { height: 8, borderRadius: 4, marginRight: 6 },
  imgWrap: { width: width - 48, height: 340, borderRadius: 28, overflow: 'hidden', shadowOpacity: 0.5, shadowRadius: 30, elevation: 10 },
  img: { width: '100%', height: '100%' },
  iconOrb: { position: 'absolute', bottom: 20, right: 20, width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.7, shadowRadius: 20, elevation: 15 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 },
  sub: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
});

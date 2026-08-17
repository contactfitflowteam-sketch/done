import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, TextStyle, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Stop, Path, G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme, Palette } from '../theme';

// ---------- GlassCard ----------
export const GlassCard: React.FC<{ children: React.ReactNode; style?: ViewStyle; onPress?: () => void; testID?: string; glow?: boolean }> = ({ children, style, onPress, testID, glow }) => {
  const { theme } = useTheme();
  const inner = (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder, shadowColor: glow ? theme.glow : '#000' },
        glow && { shadowOpacity: 0.35, shadowRadius: 18 },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (onPress) return <Pressable onPress={onPress} testID={testID} android_ripple={{ color: theme.cardBorder, borderless: false }}>{inner}</Pressable>;
  return <View testID={testID}>{inner}</View>;
};

// ---------- StatCard (2x2 grid item) ----------
export const StatCard: React.FC<{ icon: React.ComponentProps<typeof Ionicons>['name']; label: string; value: string; sublabel?: string; color?: string; onPress?: () => void; testID?: string }> = ({ icon, label, value, sublabel, color, onPress, testID }) => {
  const { theme } = useTheme();
  const c = color || theme.primary;
  return (
    <GlassCard onPress={onPress} testID={testID} style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: c + '22', shadowColor: c }]}>
        <Ionicons name={icon} size={20} color={c} />
      </View>
      <Text style={[styles.statLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      {!!sublabel && <Text style={[styles.statSub, { color: theme.textFaint }]}>{sublabel}</Text>}
    </GlassCard>
  );
};

// ---------- Circular Step Ring ----------
export const StepRing: React.FC<{ steps: number; goal: number; size?: number }> = ({ steps, goal, size = 240 }) => {
  const { theme } = useTheme();
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, steps / Math.max(1, goal));
  const dash = c * pct;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, shadowColor: theme.glow, shadowOpacity: 0.55, shadowRadius: 35, shadowOffset: { width: 0, height: 0 }, elevation: 20 }} />
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={theme.primary} />
            <Stop offset="100%" stopColor={theme.secondary} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.ringTrack} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="url(#ringGrad)" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${dash}, ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Ionicons name="walk" size={24} color={theme.primary} style={{ marginBottom: 4 }} />
        <Text style={{ color: theme.text, fontSize: 44, fontWeight: '800', letterSpacing: -1 }}>{steps.toLocaleString()}</Text>
        <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>Steps</Text>
        <Text style={{ color: theme.primary, fontSize: 12, marginTop: 6, fontWeight: '700' }}>{Math.round(pct * 100)}% Complete</Text>
      </View>
    </View>
  );
};

// ---------- BarChart (SVG) ----------
export const BarChart: React.FC<{ data: { label: string; value: number }[]; height?: number; maxValue?: number; highlightIndex?: number }> = ({ data, height = 160, maxValue, highlightIndex }) => {
  const { theme } = useTheme();
  const max = maxValue || Math.max(1, ...data.map((d) => d.value));
  const W = 320;
  const barW = (W - 24) / data.length - 8;
  return (
    <View>
      <Svg width={W} height={height}>
        <Defs>
          <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={theme.primary} />
            <Stop offset="100%" stopColor={theme.secondary} stopOpacity="0.5" />
          </LinearGradient>
        </Defs>
        {data.map((d, i) => {
          const h = Math.max(4, (d.value / max) * (height - 30));
          const x = 12 + i * ((W - 24) / data.length) + 4;
          const y = height - 20 - h;
          const isHi = highlightIndex === i;
          return (
            <G key={i}>
              <Rect x={x} y={y} width={barW} height={h} rx={6} fill={isHi ? theme.secondary : 'url(#barGrad)'} opacity={isHi ? 1 : 0.85} />
              <SvgText x={x + barW / 2} y={height - 4} fill={theme.textFaint} fontSize={10} textAnchor="middle">{d.label}</SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

// ---------- LineChart (SVG) ----------
export const LineChart: React.FC<{ series: { label: string; value: number }[]; series2?: { label: string; value: number }[]; height?: number }> = ({ series, series2, height = 140 }) => {
  const { theme } = useTheme();
  const W = 320;
  const pad = 20;
  const all = [...series, ...(series2 || [])].map((s) => s.value);
  const max = Math.max(1, ...all);
  const path = (arr: { value: number }[]) => {
    if (!arr.length) return '';
    return arr
      .map((p, i) => {
        const x = pad + (i * (W - pad * 2)) / (arr.length - 1);
        const y = height - pad - (p.value / max) * (height - pad * 2);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };
  return (
    <Svg width={W} height={height}>
      {[0, 1, 2, 3].map((i) => (
        <Line key={i} x1={pad} x2={W - pad} y1={pad + (i * (height - pad * 2)) / 3} y2={pad + (i * (height - pad * 2)) / 3} stroke={theme.divider} strokeWidth={1} />
      ))}
      {series2 && <Path d={path(series2)} stroke={theme.textFaint} strokeWidth={2} fill="none" strokeDasharray="4,4" />}
      <Path d={path(series)} stroke={theme.primary} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {series.map((p, i) => {
        const x = pad + (i * (W - pad * 2)) / (series.length - 1);
        const y = height - pad - (p.value / max) * (height - pad * 2);
        return <Circle key={i} cx={x} cy={y} r={3} fill={theme.primary} />;
      })}
      {series.map((p, i) => {
        const x = pad + (i * (W - pad * 2)) / (series.length - 1);
        return <SvgText key={'l' + i} x={x} y={height - 4} fill={theme.textFaint} fontSize={10} textAnchor="middle">{p.label}</SvgText>;
      })}
    </Svg>
  );
};

// ---------- Header ----------
export const ScreenHeader: React.FC<{ title: string; onBack?: () => void; right?: React.ReactNode; testID?: string }> = ({ title, onBack, right, testID }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.header} testID={testID}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.iconBtn} testID={`${testID || 'header'}-back`}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
      ) : <View style={{ width: 40 }} />}
      <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
      <View style={{ minWidth: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
};

// ---------- Pill Button ----------
export const PillButton: React.FC<{ label: string; onPress: () => void; variant?: 'primary' | 'ghost' | 'danger'; icon?: React.ComponentProps<typeof Ionicons>['name']; testID?: string; style?: ViewStyle }> = ({ label, onPress, variant = 'primary', icon, testID, style }) => {
  const { theme } = useTheme();
  const bg = variant === 'primary' ? theme.primary : variant === 'danger' ? theme.danger : 'transparent';
  const border = variant === 'ghost' ? theme.cardBorder : 'transparent';
  const color = variant === 'ghost' ? theme.text : (theme.name === 'amoled' && variant === 'primary' ? '#000' : '#FFF');
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={[
        styles.pill,
        { backgroundColor: bg, borderColor: border, borderWidth: 1, shadowColor: variant === 'primary' ? theme.glow : 'transparent', shadowOpacity: 0.4, shadowRadius: 12, elevation: variant === 'primary' ? 8 : 0 },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={18} color={color} style={{ marginRight: 8 }} />}
      <Text style={{ color, fontWeight: '700', fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
};

// ---------- Segmented Control ----------
export const Segmented: React.FC<{ options: string[]; value: string; onChange: (v: string) => void; testID?: string }> = ({ options, value, onChange, testID }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.segWrap, { backgroundColor: theme.bgElev, borderColor: theme.cardBorder }]} testID={testID}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable key={o} onPress={() => onChange(o)} testID={`${testID}-${o.toLowerCase()}`} style={[styles.segItem, active && { backgroundColor: theme.primary }]}>
            <Text style={{ color: active ? (theme.name === 'amoled' ? '#000' : '#FFF') : theme.textMuted, fontWeight: '700', fontSize: 13 }}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

// ---------- Row list item ----------
export const Row: React.FC<{ icon?: React.ComponentProps<typeof Ionicons>['name']; label: string; value?: string; onPress?: () => void; right?: React.ReactNode; testID?: string; danger?: boolean }> = ({ icon, label, value, onPress, right, testID, danger }) => {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.row, { borderBottomColor: theme.divider }]} testID={testID}>
      {icon && (
        <View style={[styles.rowIcon, { backgroundColor: (danger ? theme.danger : theme.primary) + '22' }]}>
          <Ionicons name={icon} size={18} color={danger ? theme.danger : theme.primary} />
        </View>
      )}
      <Text style={[styles.rowLabel, { color: danger ? theme.danger : theme.text }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {value != null && <Text style={{ color: theme.textMuted, marginRight: 6, fontSize: 13 }}>{value}</Text>}
      {right}
      {onPress && !right && <Ionicons name="chevron-forward" size={18} color={theme.textFaint} />}
    </Pressable>
  );
};

// ---------- Ad Banner Placeholder ----------
// NOTE: react-native-google-mobile-ads requires a native dev build (does not work in Expo Go).
// This is a stub that renders a labelled placeholder during preview. Replace with the real
// BannerAd (from react-native-google-mobile-ads) using AD_UNITS.banner when running a dev build.
export const AdBanner: React.FC<{ testID?: string }> = ({ testID }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.adBanner, { borderColor: theme.cardBorder, backgroundColor: theme.bgElev }]} testID={testID || 'ad-banner'}>
      <Ionicons name="megaphone-outline" size={14} color={theme.textFaint} />
      <Text style={{ color: theme.textFaint, fontSize: 11, marginLeft: 6 }}>Ad — banner slot (test)</Text>
    </View>
  );
};

// ---------- Native Ad Card (premium, matches FitFlow design) ----------
// Stub matching the design language. In a native dev build, populate the fields
// from NativeAd.createForAdRequest(AD_UNITS.native) and wrap assets in <NativeAsset>.
export const NativeAdCard: React.FC<{ testID?: string; style?: ViewStyle }> = ({ testID, style }) => {
  const { theme } = useTheme();
  return (
    <GlassCard testID={testID || 'native-ad'} style={[{ marginHorizontal: 0 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[styles.adIcon, { backgroundColor: theme.primary + '22' }]}>
          <Ionicons name="sparkles" size={22} color={theme.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: theme.text, fontWeight: '800', fontSize: 14 }}>Boost your recovery</Text>
            <View style={[styles.sponsoredTag, { backgroundColor: theme.primary }]}>
              <Text style={{ color: theme.name === 'amoled' ? '#000' : '#FFF', fontSize: 9, fontWeight: '800' }}>AD</Text>
            </View>
          </View>
          <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }} numberOfLines={2}>Sponsored — smart nutrition & sleep tips tailored to your goals.</Text>
        </View>
      </View>
      <View style={[styles.adCta, { borderColor: theme.cardBorder }]}>
        <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13 }}>Learn More</Text>
      </View>
    </GlassCard>
  );
};

// ---------- Bottom sheet-ish modal wrapper ----------
export const Sheet: React.FC<{ visible: boolean; onClose: () => void; children: React.ReactNode; title?: string }> = ({ visible, onClose, children, title }) => {
  const { theme } = useTheme();
  if (!visible) return null;
  return (
    <View style={styles.sheetOverlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: theme.bgElev, borderColor: theme.cardBorder }]}>
        {title && <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>{title}</Text>}
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 24, padding: 16, borderWidth: 1, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
  statCard: { flex: 1, padding: 14, minHeight: 108 },
  statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10, shadowOpacity: 0.5, shadowRadius: 8, elevation: 3 },
  statLabel: { fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statSub: { fontSize: 11, marginTop: 2 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 999 },
  segWrap: { flexDirection: 'row', padding: 4, borderRadius: 999, borderWidth: 1 },
  segItem: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: StyleSheet.hairlineWidth },
  rowIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
  adBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, marginHorizontal: 16, marginTop: 8 },
  adIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sponsoredTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  adCta: { marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, alignItems: 'center' },
  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', zIndex: 1000 },
  sheet: { padding: 20, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, paddingBottom: 32 },
});

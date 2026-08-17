import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'orange' | 'blue' | 'red' | 'green' | 'purple' | 'pink' | 'amoled';

export type Palette = {
  name: ThemeName;
  label: string;
  bg: string;
  bgElev: string;
  card: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  secondary: string;
  glow: string;
  ringTrack: string;
  danger: string;
  success: string;
  info: string;
  divider: string;
};

const base = {
  text: '#FFFFFF',
  textMuted: '#B8B8B8',
  textFaint: '#6B6B6B',
  danger: '#FF3D3D',
  success: '#22E07A',
  info: '#3EC5FF',
};

export const THEMES: Record<ThemeName, Palette> = {
  orange: { name: 'orange', label: 'Orange', bg: '#050505', bgElev: '#0E0E0E', card: 'rgba(28,28,28,0.85)', cardBorder: 'rgba(255,122,0,0.18)', ringTrack: 'rgba(255,122,0,0.14)', primary: '#FF7A00', secondary: '#FF9A2F', glow: '#FF7A00', divider: '#1E1E1E', ...base },
  blue: { name: 'blue', label: 'Blue', bg: '#050710', bgElev: '#0B1020', card: 'rgba(20,26,45,0.85)', cardBorder: 'rgba(58,134,255,0.22)', ringTrack: 'rgba(58,134,255,0.14)', primary: '#3A86FF', secondary: '#63A4FF', glow: '#3A86FF', divider: '#141B2D', ...base },
  red: { name: 'red', label: 'Red', bg: '#0A0505', bgElev: '#140909', card: 'rgba(35,15,15,0.85)', cardBorder: 'rgba(255,60,60,0.22)', ringTrack: 'rgba(255,60,60,0.14)', primary: '#FF3B3B', secondary: '#FF6767', glow: '#FF3B3B', divider: '#1F1010', ...base },
  green: { name: 'green', label: 'Green', bg: '#050A08', bgElev: '#0A1410', card: 'rgba(15,30,22,0.85)', cardBorder: 'rgba(34,224,122,0.22)', ringTrack: 'rgba(34,224,122,0.14)', primary: '#22E07A', secondary: '#5AF0A2', glow: '#22E07A', divider: '#101E17', ...base },
  purple: { name: 'purple', label: 'Purple', bg: '#08050D', bgElev: '#100A1B', card: 'rgba(28,20,45,0.85)', cardBorder: 'rgba(155,89,255,0.24)', ringTrack: 'rgba(155,89,255,0.14)', primary: '#9B59FF', secondary: '#BA85FF', glow: '#9B59FF', divider: '#170F26', ...base },
  pink: { name: 'pink', label: 'Pink', bg: '#0B050A', bgElev: '#150A12', card: 'rgba(38,18,32,0.85)', cardBorder: 'rgba(255,72,161,0.22)', ringTrack: 'rgba(255,72,161,0.14)', primary: '#FF48A1', secondary: '#FF7EC0', glow: '#FF48A1', divider: '#1F0F1A', ...base },
  amoled: { name: 'amoled', label: 'AMOLED Black', bg: '#000000', bgElev: '#050505', card: 'rgba(15,15,15,0.95)', cardBorder: 'rgba(255,255,255,0.08)', ringTrack: 'rgba(255,255,255,0.08)', primary: '#FFFFFF', secondary: '#BDBDBD', glow: '#FFFFFF', divider: '#0A0A0A', ...base },
};

type Ctx = { theme: Palette; themeName: ThemeName; setTheme: (n: ThemeName) => void };
const ThemeContext = createContext<Ctx>({ theme: THEMES.orange, themeName: 'orange', setTheme: () => {} });
const KEY = '@fitflow.theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('orange');
  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => { if (v && v in THEMES) setThemeName(v as ThemeName); });
  }, []);
  const setTheme = useCallback((n: ThemeName) => { setThemeName(n); AsyncStorage.setItem(KEY, n); }, []);
  const value = useMemo(() => ({ theme: THEMES[themeName], themeName, setTheme }), [themeName, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

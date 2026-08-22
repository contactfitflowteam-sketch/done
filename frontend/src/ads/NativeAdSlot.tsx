import { useEffect, useState, useCallback } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaAspectRatio,
  NativeMediaView,
} from 'react-native-google-mobile-ads';
import { adUnits, adsEnabled } from './adUnits';

type Props = { refreshMs?: number };

export function NativeAdSlot({ refreshMs }: Props) {
  const [ad, setAd] = useState<NativeAd | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!adsEnabled) return;
    let cancelled = false;
    let currentAd: NativeAd | null = null;
    setStatus('loading');
    NativeAd.createForAdRequest(adUnits.native, {
      aspectRatio: NativeMediaAspectRatio.LANDSCAPE,
      startVideoMuted: true,
      requestNonPersonalizedAdsOnly: true,
    })
      .then((value) => {
        if (cancelled) { value.destroy(); return; }
        currentAd = value;
        setAd(value);
        setStatus('loaded');
      })
      .catch((error) => {
        console.warn('[AdMob] Native ad failed:', error?.message ?? error);
        if (!cancelled) setStatus('error');
      });
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    if (refreshMs && refreshMs > 0) refreshTimer = setTimeout(reload, refreshMs);
    return () => {
      cancelled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      if (currentAd) currentAd.destroy();
    };
  }, [reloadKey, refreshMs, reload]);

  if (!adsEnabled || Platform.OS !== 'android') return null;
  if (status === 'loading')
    return <View style={styles.stateBox} testID="native-ad-loading"><Text style={styles.hint}>Loading advertisement…</Text></View>;
  if (status === 'error' || !ad)
    return <Pressable style={styles.stateBox} onPress={reload} testID="native-ad-retry"><Text style={styles.hint}>Ad unavailable — tap to retry</Text></Pressable>;

  return (
    <NativeAdView nativeAd={ad} style={styles.card} testID="native-ad-slot">
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          {ad.icon?.url ? (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <Image source={{ uri: ad.icon.url }} style={styles.icon} />
            </NativeAsset>
          ) : null}
          <View style={styles.headerText}>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text style={styles.headline} numberOfLines={2}>{ad.headline}</Text>
            </NativeAsset>
            {ad.advertiser ? (
              <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                <Text style={styles.advertiser}>{ad.advertiser}</Text>
              </NativeAsset>
            ) : null}
          </View>
          <View style={styles.adBadge}><Text style={styles.adBadgeText}>Ad</Text></View>
        </View>
        <NativeMediaView style={styles.media} resizeMode="cover" />
        {ad.body ? (
          <NativeAsset assetType={NativeAssetType.BODY}>
            <Text style={styles.body} numberOfLines={3}>{ad.body}</Text>
          </NativeAsset>
        ) : null}
        {ad.callToAction ? (
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <Text style={styles.cta}>{ad.callToAction}</Text>
          </NativeAsset>
        ) : null}
      </View>
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginVertical: 12, backgroundColor: '#111', borderRadius: 12, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: '#333' },
  inner: { padding: 12, gap: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 40, height: 40, borderRadius: 8 },
  headerText: { flex: 1 },
  headline: { color: '#fff', fontSize: 15, fontWeight: '700' },
  advertiser: { color: '#aaa', fontSize: 12, marginTop: 2 },
  adBadge: { backgroundColor: '#FF7A00', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  adBadgeText: { color: '#000', fontSize: 10, fontWeight: '800' },
  media: { width: '100%', aspectRatio: 16 / 9, borderRadius: 8, backgroundColor: '#000' },
  body: { color: '#ccc', fontSize: 13, lineHeight: 18 },
  cta: { marginTop: 4, backgroundColor: '#FF7A00', color: '#000', textAlign: 'center', paddingVertical: 10, borderRadius: 8, fontWeight: '700', fontSize: 14, overflow: 'hidden' },
  stateBox: { marginHorizontal: 16, marginVertical: 12, padding: 24, borderRadius: 12, backgroundColor: '#111', borderWidth: StyleSheet.hairlineWidth, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  hint: { color: '#888', fontSize: 12 },
});

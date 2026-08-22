import { useState, useCallback } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  type AdEventsError,
} from 'react-native-google-mobile-ads';
import { adUnits, adsEnabled } from './adUnits';

type BannerSize = keyof typeof BannerAdSize;

type Props = {
  size?: BannerSize;
};

export function BannerAdSlot({ size = 'ANCHORED_ADAPTIVE_BANNER' }: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const retry = useCallback(() => {
    setStatus('loading');
    setRefreshKey((k) => k + 1);
  }, []);

  if (!adsEnabled || Platform.OS !== 'android') return null;

  return (
    <View style={styles.container} testID="banner-ad-slot">
      {status === 'loading' && (
        <Text style={styles.hint} testID="banner-ad-loading">
          Loading advertisement…
        </Text>
      )}
      {status === 'error' && (
        <Pressable onPress={retry} testID="banner-ad-retry">
          <Text style={styles.hint}>Ad unavailable — tap to retry</Text>
        </Pressable>
      )}
      <BannerAd
        key={refreshKey}
        unitId={adUnits.banner}
        size={BannerAdSize[size]}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => setStatus('loaded')}
        onAdFailedToLoad={(error: AdEventsError) => {
          console.warn('[AdMob] Banner failed:', error?.code, error?.message);
          setStatus('error');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  hint: { fontSize: 12, color: '#888', paddingVertical: 8 },
});

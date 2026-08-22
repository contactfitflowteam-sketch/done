import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';
import { adUnits, adsEnabled } from './adUnits';

let navCount = 0;

export function useAdInterstitial(showEvery: number = 3) {
  const adRef = useRef<InterstitialAd | null>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!adsEnabled || Platform.OS !== 'android') return;
    const ad = InterstitialAd.createForAdRequest(adUnits.interstitial, {
      requestNonPersonalizedAdsOnly: true,
    });
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      isLoadedRef.current = true;
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (err) => {
      isLoadedRef.current = false;
      console.warn('[AdMob] Interstitial failed:', err?.message ?? err);
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      isLoadedRef.current = false;
      try { ad.load(); } catch {}
    });

    try { ad.load(); } catch {}

    return () => {
      unsubLoaded();
      unsubError();
      unsubClosed();
      adRef.current = null;
      isLoadedRef.current = false;
    };
  }, []);

  const maybeShow = useCallback(
    (onDone?: () => void) => {
      navCount += 1;
      const ad = adRef.current;
      const done = () => { if (onDone) onDone(); };

      if (!adsEnabled || Platform.OS !== 'android' || !ad || !isLoadedRef.current || navCount % showEvery !== 0) {
        done();
        return;
      }
      try { ad.show(); } catch (e) { console.warn('[AdMob] Interstitial show error:', e); }
      done();
    },
    [showEvery],
  );

  return { maybeShow };
}

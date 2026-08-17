import AsyncStorage from '@react-native-async-storage/async-storage';
import { INTERSTITIAL_POLICY, AD_UNITS } from './config';

// =============================================================================
// Interstitial frequency manager.
// Tracks app-open "sessions" and meaningful "interactions" with cooldown +
// per-session caps, persisted in AsyncStorage. In Expo Go / web preview this
// only manages counters (no native ad shown). In a native dev build, wire
// `showInterstitial` to react-native-google-mobile-ads (see README).
// =============================================================================

const K_SESSIONS = '@fitflow.ad.sessions';
const K_LAST_SHOWN = '@fitflow.ad.lastShown';

let interactions = 0;
let shownThisSession = 0;
let sessionCount = 0;

export async function initAdSession() {
  const raw = await AsyncStorage.getItem(K_SESSIONS);
  sessionCount = (parseInt(raw || '0', 10) || 0) + 1;
  await AsyncStorage.setItem(K_SESSIONS, String(sessionCount));
  interactions = 0;
  shownThisSession = 0;
}

export function trackInteraction(n = 1) {
  interactions += n;
}

async function canShow(): Promise<boolean> {
  if (shownThisSession >= INTERSTITIAL_POLICY.maxPerSession) return false;
  if (sessionCount < INTERSTITIAL_POLICY.minSessionsBeforeFirst && interactions < INTERSTITIAL_POLICY.minInteractionsBeforeShow) return false;
  const last = parseInt((await AsyncStorage.getItem(K_LAST_SHOWN)) || '0', 10);
  if (Date.now() - last < INTERSTITIAL_POLICY.cooldownMs) return false;
  return true;
}

/**
 * Attempt to show an interstitial at a natural transition point.
 * Returns true if an ad would be / was shown.
 *
 * NATIVE INTEGRATION (dev build only):
 *   import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
 *   const ad = InterstitialAd.createForAdRequest(AD_UNITS.interstitial);
 *   ad.addAdEventListener(AdEventType.LOADED, () => ad.show());
 *   ad.load();
 */
export async function maybeShowInterstitial(reason: string): Promise<boolean> {
  if (!(await canShow())) return false;
  shownThisSession += 1;
  await AsyncStorage.setItem(K_LAST_SHOWN, String(Date.now()));
  // eslint-disable-next-line no-console
  console.log(`[Ads] Interstitial trigger (${reason}) unit=${AD_UNITS.interstitial} session=${sessionCount} interactions=${interactions}`);
  return true;
}

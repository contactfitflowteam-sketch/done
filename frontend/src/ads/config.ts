// =============================================================================
// FitFlow AdMob Configuration
// -----------------------------------------------------------------------------
// Single source of truth for all AdMob IDs. Replace the *_PROD values with your
// real AdMob unit IDs before publishing. During development, TEST IDs are used
// automatically (Google's official test unit IDs).
//
// IMPORTANT: react-native-google-mobile-ads is a NATIVE module. It does NOT run
// in Expo Go / web preview. Install it and run a development build to see real
// ads:  yarn expo install react-native-google-mobile-ads expo-dev-client
// Then add the config plugin block (see README) with these App IDs.
// =============================================================================

export const ADMOB_CONFIG = {
  // App-level IDs (used by the config plugin in app.json)
  appId: {
    android: {
      test: 'ca-app-pub-3940256099942544~3347511713',
      prod: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX', // <-- replace
    },
    ios: {
      test: 'ca-app-pub-3940256099942544~1458002511',
      prod: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX', // <-- replace
    },
  },
  // Ad unit IDs
  banner: {
    test: 'ca-app-pub-3940256099942544/6300978111',
    prod: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // <-- replace
  },
  native: {
    test: 'ca-app-pub-3940256099942544/2247696110',
    prod: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // <-- replace
  },
  interstitial: {
    test: 'ca-app-pub-3940256099942544/1033173712',
    prod: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // <-- replace
  },
};

// Flip to false to force production IDs (only when you have real units + a build)
export const USE_TEST_ADS = true;

const pick = (o: { test: string; prod: string }) => (USE_TEST_ADS ? o.test : o.prod);

export const AD_UNITS = {
  banner: pick(ADMOB_CONFIG.banner),
  native: pick(ADMOB_CONFIG.native),
  interstitial: pick(ADMOB_CONFIG.interstitial),
};

// ---- Interstitial frequency policy (non-aggressive) -------------------------
export const INTERSTITIAL_POLICY = {
  minSessionsBeforeFirst: 3,   // don't show until the app has been opened 3+ times
  minInteractionsBeforeShow: 3, // OR after 3+ meaningful feature interactions
  cooldownMs: 90 * 1000,        // at least 90s between interstitials
  maxPerSession: 2,             // never more than 2 per app session
};

// External / store links (configurable placeholders)
export const APP_LINKS = {
  playStore: 'https://play.google.com/store/apps/details?id=com.fitflow.app', // <-- replace when live
  instagram: 'https://www.instagram.com/fit__floww___?igsh=MXZld2U1dHo2OWc0cg==',
  twitter: 'https://x.com/fitflowkwo?s=11',
  facebook: 'https://www.facebook.com/share/1LwafnaAcC/?mibextid=wwXIfr',
  supportEmail: 'contactfitflowteam@gmail.com',
};

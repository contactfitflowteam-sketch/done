import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const isProduction = process.env.EXPO_PUBLIC_AD_MODE === 'production';

const prodBanner = process.env.EXPO_PUBLIC_ADMOB_BANNER_ID;
const prodInterstitial = process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID;
const prodNative = process.env.EXPO_PUBLIC_ADMOB_NATIVE_ID;

export const adUnits = {
  banner: isProduction && prodBanner ? prodBanner : TestIds.BANNER,
  interstitial:
    isProduction && prodInterstitial ? prodInterstitial : TestIds.INTERSTITIAL,
  native: isProduction && prodNative ? prodNative : TestIds.NATIVE,
};

export const adsEnabled = Platform.OS === 'android';
export const isProductionAds = isProduction;

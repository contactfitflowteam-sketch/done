const TEST_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';

module.exports = ({ config }) => {
  const androidAppId = process.env.ADMOB_ANDROID_APP_ID || TEST_ANDROID_APP_ID;

  const basePlugins = (config.plugins || []).filter((p) => {
    if (typeof p === 'string') return p !== 'react-native-google-mobile-ads';
    if (Array.isArray(p)) return p[0] !== 'react-native-google-mobile-ads';
    return true;
  });

  return {
    ...config,
    plugins: [
      ...basePlugins,
      [
        'react-native-google-mobile-ads',
        {
          androidAppId,
          iosAppId: 'ca-app-pub-3940256099942544~1458002511',
          userTrackingUsageDescription:
            'This identifier will be used to deliver personalized ads to you.',
        },
      ],
    ],
  };
};

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  socketUrl: 'http://localhost:3000',
  googleMapsApiKey: 'AIzaSyA85HFedGjgP12MG_dvR-MVgooWTcJNIb0',
  razorpayKeyId: 'rzp_test_TaT9JyM7hmv5t1',
  version: '0.0.3 (Development)',
  admob: {
    enabled: false, // Set to true when ready to enable Google AdMob in the app
    // Official Google AdMob Test Ad Unit IDs (Android)
    bannerAdUnitId: 'ca-app-pub-3940256099942544/6300978111',
    interstitialAdUnitId: 'ca-app-pub-3940256099942544/1033173712',
    rewardedAdUnitId: 'ca-app-pub-3940256099942544/5224354917',
    isTesting: true
  }
};


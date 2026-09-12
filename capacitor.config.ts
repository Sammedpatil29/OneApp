import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.oneapp',
  appName: 'Pintu - Minutes App',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Keyboard: {
      resize: 'body'
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      launchFadeOutDuration: 0,
      showSpinner: false,
      backgroundColor: '#f8fafc'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    OtaKit: {
      appId: 'io.ionic.oneapp',
      cdnUrl: 'https://pintu-api.democompany.in.net/ota',
      allowInsecureUrls: true,
      resetWhenUpdate: true,
      autoDeleteFailedBundles: true
    },
    Cordova: {}
  }
};

export default config;

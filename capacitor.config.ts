import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.oneapp',
  appName: 'Pintu - Minutes App',
  webDir: 'www',
  backgroundColor: '#a000e2',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['phone']
    },
    SplashScreen: {
      backgroundColor: '#a000e2',
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Cordova: {}
  },
  server: {
    url: 'https://pintu.democompany.in.net/',
    cleartext: true,
    errorPath: 'offline.html'
  }
};

export default config;

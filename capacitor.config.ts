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
      launchShowDuration: 0,
      launchAutoHide: true,
      launchFadeOutDuration: 0,
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Cordova: {}
  },
  server: {
    url: 'https://pintu-teal.vercel.app/',
    cleartext: true,
    errorPath: 'offline.html'
  }
};

export default config;

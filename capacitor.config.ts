import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.oneapp',
  appName: 'Pintu - Minutes App',
  webDir: 'www',
  backgroundColor: '#a000e2',
  plugins: {
    // StatusBar: {
    //   overlaysWebView: true,
    // },
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
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    OtaKit: {
      appId: 'io.ionic.oneapp',
      cdnUrl: 'https://pintu-api.democompany.in.net/ota',
      allowInsecureUrls: true
    },
    Cordova: {}
  },
  // server: {
  //   url: 'https://pintu.democompany.in.net/',
  //   cleartext: true,
  //   errorPath: 'offline.html'
  // }
};

export default config;

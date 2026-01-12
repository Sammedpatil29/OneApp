import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.oneapp',
  appName: 'Pintu - Minutes App',
  webDir: 'www',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['phone']
    },
    Cordova: {}
  }
};

export default config;


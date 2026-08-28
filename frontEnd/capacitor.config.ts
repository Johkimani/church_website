import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.csakyu.app',
  appName: 'CSA Kirinyaga',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: process.env.CAPACITOR_SERVER_URL || undefined,
    cleartext: process.env.NODE_ENV === 'development',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#1e293b',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1e293b',
    },
    App: {
      // Back button handled by React Router
    },
  },
  android: {
    allowMixedContent: process.env.NODE_ENV === 'development',
    backgroundColor: '#1e293b',
  },
  ios: {
    backgroundColor: '#1e293b',
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
};

export default config;

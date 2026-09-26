import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wordspacestanvi.app',
  appName: 'Wordscapes English and Shona',
  webDir: 'dist',
  android: {
    backgroundColor: '#0f172a',
    allowMixedContent: false,
    captureInput: true,
  }
};

export default config;

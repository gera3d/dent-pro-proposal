import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dentexperts.scoper',
  appName: 'Dent Experts Scoper',
  webDir: 'capacitor-www',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'capacitor'
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
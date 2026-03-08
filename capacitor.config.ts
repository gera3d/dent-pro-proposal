import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dentexperts.scoper',
  appName: 'Dent Experts Scoper',
  webDir: 'capacitor-www',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'https'   // Use https://localhost so GHL/Airtable CORS rules accept the origin
  },
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
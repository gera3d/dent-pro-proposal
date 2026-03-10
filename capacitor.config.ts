import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dentexperts.scoper',
  appName: 'Dent Experts',
  webDir: 'capacitor-www',
  bundledWebRuntime: false,
  server: {
    iosScheme: 'https'   // Use https://localhost so GHL/Airtable CORS rules accept the origin
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#000000'
  }
};

export default config;

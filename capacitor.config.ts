import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cafeqr.app',
  appName: 'CafeQR',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;

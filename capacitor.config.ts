import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cafeqr.app',
  appName: 'Cafe QR POS',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    hostname: 'cafeqr-frontend.pages.dev',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;


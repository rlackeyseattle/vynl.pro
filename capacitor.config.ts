import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pro.vynl.app',
  appName: 'Vynl Pro',
  webDir: 'out',
  server: {
    url: 'https://www.vynl.pro',
    cleartext: true
  }
};

export default config;

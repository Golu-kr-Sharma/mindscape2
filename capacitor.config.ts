import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mindscape.app',
  appName: 'Mindscape',
  webDir: 'build',
  server: {
    // Use emulator host mapping for local development.
    url: 'http://10.0.2.2:9003',
    cleartext: true,
  },
};

export default config;

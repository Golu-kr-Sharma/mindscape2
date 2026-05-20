import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mindscape.app',
  appName: 'Mindscape',
  webDir: 'build',
  server: {
    // Use emulator host mapping for local development.
    // Use remote Vercel deployment
    url: 'https://mindscape2.vercel.app/',
    cleartext: false,
  },
};

export default config;

import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',workers:2,timeout:45000,
  use:{baseURL:'http://127.0.0.1:4173',launchOptions:{executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']}},
  webServer:{command:'vite preview --host 127.0.0.1 --outDir dist-test --port 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},
});

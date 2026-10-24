import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { routes } from './src/content.js';

const pages = ['editor', ...Object.keys(routes).map(path => path === '/' ? 'index' : path.slice(1))];
export default defineConfig({
  build: { rollupOptions: { input: Object.fromEntries(pages.map(p => [p, resolve(import.meta.dirname, `${p}.html`)])) } },
});

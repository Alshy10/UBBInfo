import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Served from https://itswaferz.github.io/UBBInfo/ on GitHub Pages.
  base: '/UBBInfo/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});

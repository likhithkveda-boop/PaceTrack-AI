import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative URLs work both at the GitHub Pages project subpath and on local hosting.
export default defineConfig({
  base: './',
  plugins: [react()],
});

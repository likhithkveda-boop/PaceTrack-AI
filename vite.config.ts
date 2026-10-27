import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project from /PaceTrack-AI/, not from the domain root.
export default defineConfig({
  base: '/PaceTrack-AI/',
  plugins: [react()],
});

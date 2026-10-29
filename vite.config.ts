import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This repository is deployed as a GitHub Pages project site.
export default defineConfig({ plugins: [react()], base: '/PaceTrack-AI/' });
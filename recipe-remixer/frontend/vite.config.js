import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build', // Firebase Hosting expects the build output in 'build' directory
  },
  server: {
    port: 5173, // Keep the port as you want
  }
});

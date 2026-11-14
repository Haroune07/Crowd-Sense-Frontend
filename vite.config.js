import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// `npm run phone` uses mode "phone": https with a self-signed certificate, so a phone on the
// same Wi-Fi or hotspot can use the camera and location (they only work on https).
export default defineConfig(({ mode }) => ({
  plugins: mode === 'phone' ? [react(), basicSsl()] : [react()],
  server: {
    allowedHosts: true,
    // With VITE_API_URL=/ the app calls /api on its own address, and Vite forwards it to the backend.
    // So the phone only needs one link.
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
}));

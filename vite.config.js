import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(), tailwindcss()],
// })

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  server: {
    host: "0.0.0.0",
    port: 5173,
  },

  preview: {
    host: "0.0.0.0",
    port: process.env.PORT || 4173,
    allowedHosts: [
      "brilliant-intuition-production-07c6.up.railway.app",
      "pumpkinpicturesllp.uk",
      "www.pumpkinpicturesllp.uk"
    ]
  }
});
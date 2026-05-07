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
    allowedHosts: ["frontend-production-e755a.up.railway.app"],
  },

  preview: {
    allowedHosts: ["frontend-production-e755a.up.railway.app"],
  },
});
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8080', // proxy API Hono en dev
    },
  },
  build: {
    outDir: 'dist/client', // build ira dans client/dist
  },
})

import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: '_build',   // compiled JS/CSS here — keeps it out of /assets/ (game assets)
  },
  server: {
    port: 5173
  }
})

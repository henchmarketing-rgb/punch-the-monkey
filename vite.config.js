import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: '_build',
  },
  server: {
    port: 5173
  }
})

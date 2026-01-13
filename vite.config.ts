import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: true,
  },
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: `
@use "${path.resolve(__dirname, 'src/styles/variables/_index.sass')}" as v
@use "${path.resolve(__dirname, 'src/styles/mixins/_index.sass')}" as m
`,
      },
    },
  },
})

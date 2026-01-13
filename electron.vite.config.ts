import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// electron-viteの設定
// main: メインプロセス、preload: プリロードスクリプト、renderer: レンダラー（React）
export default defineConfig({
  // メインプロセスの設定
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist-electron/main',
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs',
        },
      },
    },
  },

  // プリロードスクリプトの設定
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'dist-electron/preload',
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: '[name].cjs',
        },
      },
    },
  },

  // レンダラー（React）の設定
  renderer: {
    root: '.', // index.htmlがプロジェクトルートにある
    build: {
      outDir: 'dist-electron/renderer',
      rollupOptions: {
        input: './index.html',
      },
    },
    plugins: [react()],
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
  },
})

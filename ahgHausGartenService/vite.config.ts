import path from 'node:path'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

import { configureApi } from './server/api'

const env = { ...loadEnv(process.env.NODE_ENV || 'development', process.cwd(), ''), ...process.env }

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    ...configureApi(env),
    tailwindcss(),
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': path.resolve('src'),
    },
  },
})

import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const require = createRequire(import.meta.url)

export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({ targets: [{ src: 'BiliChat/docs', dest: '.', rename: 'BiliChat' }] }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.js',
      injectRegister: false,
      manifest: false, // Keep public/manifest.json and the existing registration code.
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json}'],
        globIgnores: ['BiliChat/**'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      // Element UI's CommonJS imports must share the application's Vue instance.
      { find: /^vue$/, replacement: require.resolve('vue/dist/vue.runtime.esm.js') },
      // BrowserLevel needs the browser polyfills formerly supplied by webpack.
      { find: /^events$/, replacement: require.resolve('events/') },
      { find: /^buffer$/, replacement: require.resolve('buffer/') },
    ],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  optimizeDeps: { entries: ['index.html'] },
  define: {
    COMMIT_HASH: JSON.stringify(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()),
    'process.env.BASE_URL': JSON.stringify('/'),
  },
  css: { devSourcemap: true },
  build: { sourcemap: true },
})

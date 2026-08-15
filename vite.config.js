import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

function listFormCatalog() {
  const files = []
  const skip = new Set(['node_modules', 'dist', 'src', '.git', 'public'])

  function walk(absDir, urlBase) {
    let entries
    try {
      entries = fs.readdirSync(absDir, { withFileTypes: true })
    } catch {
      return
    }
    for (const ent of entries) {
      if (ent.name.startsWith('.') || skip.has(ent.name)) {
        continue
      }
      const abs = path.join(absDir, ent.name)
      const url = urlBase + '/' + ent.name
      if (ent.isDirectory()) {
        walk(abs, url)
        continue
      }
      if (/\.(js|vue)$/i.test(ent.name) && !ent.name.endsWith('.min.js')) {
        files.push({
          path: url,
          label: ent.name,
          folder: urlBase || '/',
          kind: /\.vue$/i.test(ent.name) ? 'vue' : 'js',
        })
      }
    }
  }

  walk(path.join(rootDir, 'test'), '/test')
  let rootEntries = []
  try {
    rootEntries = fs.readdirSync(rootDir, { withFileTypes: true })
  } catch {
    rootEntries = []
  }
  for (const ent of rootEntries) {
    if (ent.isDirectory() && (ent.name.startsWith('รพ-') || ent.name === 'forms')) {
      walk(path.join(rootDir, ent.name), '/' + ent.name)
    }
  }
  return files.sort((a, b) => a.path.localeCompare(b.path, 'th'))
}

function formCatalogPlugin() {
  const send = (res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(listFormCatalog()))
  }
  return {
    name: 'form-catalog',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.split('?')[0] === '/__forms.json') {
          send(res)
          return
        }
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.split('?')[0] === '/__forms.json') {
          send(res)
          return
        }
        next()
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), formCatalogPlugin()],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  server: {
    host: '0.0.0.0',
    fs: {
      allow: ['.'],
    },
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  optimizeDeps: {
    exclude: ['vue3-sfc-loader'],
  },
})

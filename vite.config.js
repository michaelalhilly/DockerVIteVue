import { fileURLToPath, URL } from 'url'
import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import { readFileSync, readdirSync } from 'fs'
import vue from '@vitejs/plugin-vue'

// Exports Vite config.

export default ({ mode }) => {

  // Loads env variables.

  const env = loadEnv(mode, process.cwd(), '')

  // Gets https mode and base URL.
  
  const isHTTPS = process.argv.includes("--https")
  const containerIP = "0.0.0.0"
  const containerPort = isHTTPS ? "443" : "8080"
  const baseURL = isHTTPS ? `https://${containerIP}:443` : `http://${containerIP}:8080`

  // Gets proxy entry for each entry in src/pages.
  
  let proxyEntries = readdirSync(resolve("./src/pages"))
    .reduce((entries, filePath) => {
  
      // Gets file name without it's extension.
  
      let fileName = filePath
        .split("/")
        .pop()
        .split(".")
        .shift()
  
      // Skips if no file name is returned.
  
      if (fileName === '') return entries
  
      // Adds entry.
  
      entries[`/${fileName}/`] = {
        target: baseURL,
        changeOrigin: true,
        rewrite: (_) => `/src/pages/${fileName}.html`
      }
  
      // Returns updated entries.
  
      return entries
    }, {})
  
  // Adds socket.io entry so site can stay connected to dev server.
  
  proxyEntries['/socket.io'] = {
    target: `ws://${containerIP}:${containerPort}`,
    ws: true
  }

  // Configures http dev server.
  
  let server = {
    host: containerIP,
    port: containerPort,
    https: false,
    proxy: proxyEntries
  }
  
  // Adds HTTPS key and cert.
  // @todo This is not working.
  
  if (isHTTPS) {
    server.https = {
      key: readFileSync(resolve(`${env.LOCAL_KEY}`)),
      cert: readFileSync(resolve(`${env.LOCAL_CERT}`))
    }
  }

  // Returns Vite config.
  
  return defineConfig({
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          success: resolve(__dirname, 'src/pages/success.html')
        }
      }
    },
    server: server
  })
}

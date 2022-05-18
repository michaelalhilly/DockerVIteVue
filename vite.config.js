import { fileURLToPath, URL } from 'url'
import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'
import vue from '@vitejs/plugin-vue'

// Exports Vite config.

export default ({ mode }) => {

  // Loads env variables.

  const env = loadEnv(mode, process.cwd(), '')

  // Configures http dev server.
  
  let devServer = {
    host: '0.0.0.0',
    port: 8080,
    https: false,
    proxy: {
      '/socket.io': {
        target: 'ws://0.0.0.0:8080',
        ws: true
      }
    }
  }
  
  // Configures https dev server.
  // @todo This is not working.
  
  if (process.argv.includes("--https")) {
    const ssl_key = resolve(`${env.LOCAL_KEY}`)
    const ssl_cert = resolve(`${env.LOCAL_CERT}`)

    devServer = {
      host: '0.0.0.0',
      port: 443,
      https: {
        key: readFileSync(ssl_key),
        cert: readFileSync(ssl_cert)
      },
      proxy: {
        '/socket.io': {
          target: `ws://${env.LOCAL_URL}`,
          ws: true
        }
      }
    }
  }

  // Returns config.
  
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
          success: resolve(__dirname, 'success/index.html')
        }
      }
    },
    server: devServer
  })
}

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const securityTxtPath = resolve(__dirname, 'public/.well-known/security.txt')

// Sert security.txt : Vite ignore par defaut les dossiers commencant par ".".
const securityTxtPlugin = () => ({
  name: 'serve-security-txt',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url?.split('?')[0]
      if (url !== '/.well-known/security.txt' && url !== '/security.txt') {
        next()
        return
      }

      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end(readFileSync(securityTxtPath, 'utf-8'))
    })
  },
})

export default defineConfig({
  plugins: [tailwindcss(), securityTxtPlugin()],
  server: {
    port: 5173,
    strictPort: true,
  },
})
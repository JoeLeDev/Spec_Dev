import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { CSP_REPORT_ONLY_POLICY, CSP_REPORTING_ENDPOINTS } from './src/config/csp.js'

const securityTxtPath = resolve(__dirname, 'public/.well-known/security.txt')

// Sert security.txt : Vite ignore par défaut les dossiers commençant par « . ».
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

const cspDevHeaders = {
  'Content-Security-Policy-Report-Only': CSP_REPORT_ONLY_POLICY,
  'Reporting-Endpoints': CSP_REPORTING_ENDPOINTS,
}

export default defineConfig({
  plugins: [tailwindcss(), securityTxtPlugin()],
  server: {
    port: 5173,
    strictPort: true,
    headers: cspDevHeaders,
  },
  preview: {
    headers: cspDevHeaders,
  },
})
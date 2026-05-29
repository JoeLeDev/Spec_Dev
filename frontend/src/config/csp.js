import { API_BASE_URL } from '../utils/constants.js'

export const CSP_REPORT_URI = `${API_BASE_URL}/csp-reports`

// Politique Report-Only : remonte les violations sans casser Vite (HMR, inline dev).
export const CSP_REPORT_ONLY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: http://localhost:3000",
  `connect-src 'self' ${API_BASE_URL} ws://localhost:5173`,
  `report-uri ${CSP_REPORT_URI}`,
  'report-to csp-endpoint',
].join('; ')

export const CSP_REPORTING_ENDPOINTS = `csp-endpoint="${CSP_REPORT_URI}"`

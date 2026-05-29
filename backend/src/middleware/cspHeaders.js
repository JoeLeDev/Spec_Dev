const CSP_REPORT_URI =
  process.env.CSP_REPORT_URI ?? 'http://localhost:3000/csp-reports'

// Politique minimale pour les réponses API + envoi des violations vers /csp-reports.
const buildApiCsp = () =>
  [
    "default-src 'none'",
    "frame-ancestors 'none'",
    `report-uri ${CSP_REPORT_URI}`,
    'report-to csp-endpoint',
  ].join('; ')

// Ajoute les en-têtes CSP et Reporting-Endpoints sur chaque réponse backend.
export const apiCspHeaders = (_req, res, next) => {
  res.setHeader('Content-Security-Policy', buildApiCsp())
  res.setHeader('Reporting-Endpoints', `csp-endpoint="${CSP_REPORT_URI}"`)
  next()
}

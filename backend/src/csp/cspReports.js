import crypto from 'node:crypto'
import express from 'express'

const router = express.Router()

// Parse les corps JSON des navigateurs (application/csp-report, reports+json).
const parseCspReportBody = express.json({
  type: ['application/json', 'application/csp-report', 'application/reports+json'],
  limit: '32kb',
})
const reports = []
const MAX_REPORTS = 100

// Extrait les champs utiles d'un rapport CSP (formats navigateur variés).
const normalizeReport = (body = {}) => {
  const payload = body['csp-report'] ?? body.report ?? body

  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    directive: payload['violated-directive'] ?? payload.violatedDirective ?? 'N/A',
    blockedUri: payload['blocked-uri'] ?? payload.blockedUri ?? payload.blockedURL ?? 'N/A',
    documentUri: payload['document-uri'] ?? payload.documentUri ?? payload.documentURL ?? 'N/A',
  }
}

// GET /csp-reports — liste des rapports (session requise).
const listerRapports = (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ erreur: 'non connecté' })
  }

  res.json(reports)
}

// POST /csp-reports — enregistre une violation (report-uri navigateur).
const recevoirRapport = (req, res) => {
  const normalized = normalizeReport(req.body)
  reports.unshift(normalized)

  if (reports.length > MAX_REPORTS) {
    reports.length = MAX_REPORTS
  }

  res.status(204).end()
}

router.get('/', listerRapports)
router.post('/', parseCspReportBody, recevoirRapport)

export default router

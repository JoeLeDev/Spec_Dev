import express from 'express'
import prisma from '../prisma.js'

const router = express.Router()
const MAX_REPORTS = 100

// Parse les corps JSON des navigateurs (application/csp-report, reports+json).
const parseCspReportBody = express.json({
  type: ['application/json', 'application/csp-report', 'application/reports+json'],
  limit: '32kb',
})

// Extrait les champs utiles d'un rapport CSP (formats navigateur variés).
const normalizeReport = (body = {}) => {
  const payload = body['csp-report'] ?? body.report ?? body

  return {
    directive: payload['violated-directive'] ?? payload.violatedDirective ?? 'N/A',
    blockedUri: payload['blocked-uri'] ?? payload.blockedUri ?? payload.blockedURL ?? 'N/A',
    documentUri: payload['document-uri'] ?? payload.documentUri ?? payload.documentURL ?? 'N/A',
  }
}

// Formate un enregistrement Prisma pour le front.
const mapReportToApi = (report) => ({
  id: report.id,
  date: report.createdAt.toISOString(),
  directive: report.directive,
  blockedUri: report.blockedUri,
  documentUri: report.documentUri,
})

// GET /csp-reports — liste des rapports (session requise).
const listerRapports = async (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ erreur: 'non connecté' })
  }

  try {
    const reports = await prisma.cspReport.findMany({
      orderBy: { createdAt: 'desc' },
      take: MAX_REPORTS,
    })

    res.json(reports.map(mapReportToApi))
  } catch (error) {
    console.error(error)
    res.status(500).json({ erreur: 'Impossible de charger les rapports CSP' })
  }
}

// POST /csp-reports — enregistre une violation (report-uri navigateur).
const recevoirRapport = async (req, res) => {
  try {
    const data = normalizeReport(req.body)
    await prisma.cspReport.create({ data })

    const count = await prisma.cspReport.count()
    if (count > MAX_REPORTS) {
      const oldest = await prisma.cspReport.findMany({
        orderBy: { createdAt: 'asc' },
        take: count - MAX_REPORTS,
        select: { id: true },
      })

      if (oldest.length) {
        await prisma.cspReport.deleteMany({
          where: { id: { in: oldest.map((row) => row.id) } },
        })
      }
    }

    res.status(204).end()
  } catch (error) {
    console.error(error)
    res.status(500).json({ erreur: "Impossible d'enregistrer le rapport CSP" })
  }
}

router.get('/', listerRapports)
router.post('/', parseCspReportBody, recevoirRapport)

export default router

import { apiRequest } from './apiClient.js'

const CSP_ENDPOINTS = ['/csp-reports', '/csp/reports']

// Normalise un rapport CSP API vers le format affiché front.
const mapCspReportFromApi = (report) => ({
  date: report.date ?? report.createdAt ?? report.timestamp ?? 'N/A',
  directive: report.directive ?? report.violatedDirective ?? 'N/A',
  blockedUri: report.blockedUri ?? report.blockedURL ?? 'N/A',
  documentUri: report.documentUri ?? report.documentURL ?? report.sourceFile ?? 'N/A',
})

const isNotFoundError = (error) => {
  const message = String(error?.message ?? '')
  return message.includes('404') || message.toLowerCase().includes('introuvable')
}

// Tente de charger les rapports depuis le premier endpoint disponible.
const fetchFromApi = async () => {
  let lastError = null
  let sawNotFound = false

  for (const endpoint of CSP_ENDPOINTS) {
    try {
      const data = await apiRequest(endpoint, { method: 'GET' })
      if (Array.isArray(data)) return data.map(mapCspReportFromApi)
      if (data && Array.isArray(data.reports)) return data.reports.map(mapCspReportFromApi)
    } catch (error) {
      lastError = error
      if (isNotFoundError(error)) sawNotFound = true
    }
  }

  if (sawNotFound && !lastError?.message?.includes('joindre le serveur')) {
    throw new Error(
      "Endpoint CSP introuvable sur le backend. Demande à ton équipe la route GET /csp-reports."
    )
  }

  throw lastError ?? new Error('Aucun endpoint CSP report disponible côté backend.')
}

// Récupère les derniers rapports CSP depuis l'API backend.
export const getCspReports = async () => fetchFromApi()

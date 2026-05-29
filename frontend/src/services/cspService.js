import { apiRequest } from './apiClient.js'
import { MOCK_STORAGE_KEYS } from '../utils/constants.js'

const MOCK_CSP_REPORTS = [
  {
    date: '2026-05-28T14:00:00.000Z',
    directive: 'script-src',
    blockedUri: 'inline',
    documentUri: 'http://localhost:5173/products',
  },
]

// Lit les rapports CSP stockes localement.
const readLocalCspReports = () => {
  const raw = localStorage.getItem(MOCK_STORAGE_KEYS.CSP_REPORTS)
  if (!raw) return MOCK_CSP_REPORTS

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : MOCK_CSP_REPORTS
  } catch {
    return MOCK_CSP_REPORTS
  }
}

// Recupere les derniers rapports CSP.
export const getCspReports = async () => {
  try {
    const data = await apiRequest('/csp-reports', { method: 'GET' })
    if (Array.isArray(data)) return data
    return readLocalCspReports()
  } catch {
    return readLocalCspReports()
  }
}

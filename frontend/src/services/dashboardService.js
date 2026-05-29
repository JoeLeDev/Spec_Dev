import { getState } from '../app/store.js'
import { getCspReports } from './cspService.js'
import { getProducts } from './productService.js'

// Charge les indicateurs affichés sur le dashboard connecté.
export const getDashboardSummary = async () => {
  const user = getState().auth.user
  const [products, cspReports] = await Promise.all([getProducts(), getCspReports()])

  return {
    userEmail: user?.email ?? 'N/A',
    productCount: products.length,
    cspReportCount: cspReports.length,
  }
}

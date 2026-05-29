import { getDashboardSummary } from '../services/dashboardService.js'
import { ROUTES } from '../utils/constants.js'
import { clearElement, setSafeText } from '../utils/dom.js'

// Crée une carte de statistique pour le dashboard.
const createStatCard = (label, value, { isEmail = false } = {}) => {
  const card = document.createElement('article')
  card.className = 'min-w-0 max-w-full rounded-lg border border-slate-700 bg-slate-900 p-4'

  const title = document.createElement('p')
  title.className = 'text-xs uppercase tracking-wide text-slate-400'
  setSafeText(title, label)

  const metric = document.createElement('p')
  metric.className = isEmail
    ? 'mt-2 break-all text-base font-semibold text-indigo-300 sm:text-lg'
    : 'mt-2 text-2xl font-bold text-indigo-300'
  setSafeText(metric, String(value))

  card.append(title, metric)
  return card
}

// Construit la page dashboard avec résumé compte / produits / CSP.
export const createDashboardPage = () => {
  const page = document.createElement('section')
  page.className = 'page-section space-y-4'

  const heading = document.createElement('h1')
  heading.className = 'text-2xl font-bold sm:text-3xl'
  heading.textContent = 'Dashboard'

  const subtitle = document.createElement('p')
  subtitle.className = 'text-sm text-slate-300 sm:text-base'
  subtitle.textContent = "Résumé de votre session et de l'activité boutique."

  const loading = document.createElement('p')
  loading.className = 'text-sm text-slate-300'
  loading.textContent = 'Chargement du résumé...'

  const error = document.createElement('p')
  error.className = 'text-sm text-red-400'
  error.setAttribute('role', 'alert')

  const grid = document.createElement('div')
  grid.className = 'grid w-full min-w-0 max-w-full grid-cols-1 gap-4 md:grid-cols-3'

  const links = document.createElement('nav')
  links.className = 'flex w-full min-w-0 flex-col gap-2 text-sm sm:flex-row sm:flex-wrap sm:gap-3'
  links.setAttribute('aria-label', 'Raccourcis dashboard')

  getDashboardSummary()
    .then((summary) => {
      loading.remove()
      clearElement(grid)

      grid.append(
        createStatCard('Utilisateur connecté', summary.userEmail, { isEmail: true }),
        createStatCard('Produits', summary.productCount),
        createStatCard('Rapports CSP', summary.cspReportCount)
      )

      const shortcuts = [
        { href: ROUTES.PRODUCTS, label: 'Voir les produits' },
        { href: ROUTES.PRODUCT_NEW, label: 'Nouveau produit' },
        { href: ROUTES.CSP_REPORT, label: 'Rapports CSP' },
        { href: ROUTES.STATS_CATEGORIES, label: 'Stats catégories' },
      ]

      shortcuts.forEach(({ href, label }) => {
        const link = document.createElement('a')
        link.setAttribute('data-link', 'true')
        link.href = href
        link.className =
          'inline-flex min-w-0 items-center rounded-md border border-slate-600 px-3 py-2 text-indigo-300 hover:bg-slate-800'
        link.textContent = label
        links.append(link)
      })
    })
    .catch((err) => {
      loading.remove()
      setSafeText(error, err.message || 'Impossible de charger le dashboard.')
    })

  page.append(heading, subtitle, loading, error, grid, links)
  return page
}

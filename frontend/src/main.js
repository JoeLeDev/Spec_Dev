import './style.css'
import { initRouter, navigateTo, registerRoute } from './app/router.js'
import { ROUTES } from './utils/constants.js'
import { hydrateAuthFromStorage, isAuthenticated, logout } from './services/authService.js'
import { createLoginPage } from './pages/LoginPage.js'
import { createRegisterPage } from './pages/RegisterPage.js'
import { createProductsPage } from './pages/ProductsPage.js'
import { createCartPage } from './pages/CartPage.js'
import { createProductDetailPage } from './pages/ProductDetailPage.js'
import { createDashboardPage } from './pages/DashboardPage.js'
import { createStatsCategoriesPage } from './pages/StatsCategoriesPage.js'
import { createProductFormPage } from './pages/ProductFormPage.js'
import { createCspReportPage } from './pages/CspReportPage.js'
import { getCartCount } from './services/cartService.js'
import { redirectIfAuthenticated, requireAuth } from './app/guards.js'

// Création de la page
const createPage = (title) => {
  const authenticated = isAuthenticated()
  const cartCount = getCartCount()
  const authLinks = authenticated
    ? `
      <a data-link href="${ROUTES.DASHBOARD}" class="text-indigo-300 hover:underline">Dashboard</a>
      <a data-link href="${ROUTES.CSP_REPORT}" class="text-indigo-300 hover:underline">CSP</a>
      <button id="logout-btn" class="text-red-300 hover:underline">Déconnexion</button>
    `
    : `
      <a data-link href="${ROUTES.LOGIN}" class="text-indigo-300 hover:underline">Connexion</a>
      <a data-link href="${ROUTES.REGISTER}" class="text-indigo-300 hover:underline">Inscription</a>
    `

  const el = document.createElement('main')
  el.className = 'min-h-screen bg-slate-900 p-8 text-white'
  el.innerHTML = `
    <nav class="mb-6 flex gap-4 text-sm">
      <a data-link href="${ROUTES.PRODUCTS}" class="text-indigo-300 hover:underline">Produits</a>
      <a data-link href="${ROUTES.CART}" class="text-indigo-300 hover:underline">
        Panier (<span data-cart-count>${cartCount}</span>)
      </a>
      <a data-link href="${ROUTES.STATS_CATEGORIES}" class="text-indigo-300 hover:underline">Stats</a>
      ${authLinks}
    </nav>
    <h1 class="text-3xl font-bold">${title}</h1>
  `

  const logoutButton = el.querySelector('#logout-btn')
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      try {
        await logout()
      } catch {
        // En dev sans backend/CORS, on garde une deconnexion locale non bloquante.
      }
      navigateTo(ROUTES.LOGIN)
    })
  }

  return el
}

const updateCartBadges = () => {
  const count = getCartCount()
  document.querySelectorAll('[data-cart-count]').forEach((node) => {
    node.textContent = String(count)
  })
}

// Création de la page avec le layout
const withLayout = (contentFactory) => (routeContext = {}) => {
  const shell = createPage('')
  const title = shell.querySelector('h1')
  if (title) title.remove()
  shell.append(contentFactory(routeContext))
  return shell
}

// Enregistrement des routes
registerRoute(ROUTES.LOGIN, redirectIfAuthenticated(createLoginPage))
registerRoute(ROUTES.REGISTER, redirectIfAuthenticated(createRegisterPage))
registerRoute(ROUTES.PRODUCTS, withLayout(createProductsPage))
registerRoute(ROUTES.PRODUCT_NEW, requireAuth(withLayout(createProductFormPage)))
registerRoute(ROUTES.PRODUCT_EDIT, requireAuth(withLayout(createProductFormPage)))
registerRoute(ROUTES.PRODUCT_DETAIL, withLayout(createProductDetailPage))
registerRoute(ROUTES.CART, withLayout(createCartPage))
registerRoute(ROUTES.STATS_CATEGORIES, withLayout(createStatsCategoriesPage))
registerRoute(ROUTES.DASHBOARD, requireAuth(withLayout(createDashboardPage)))
registerRoute(ROUTES.CSP_REPORT, requireAuth(withLayout(createCspReportPage)))
registerRoute('/404', () => createPage('404'))

hydrateAuthFromStorage()
window.addEventListener('cart:updated', updateCartBadges)
initRouter()
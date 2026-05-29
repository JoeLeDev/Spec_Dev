import './style.css'
import { initRouter, registerRoute } from './app/router.js'
import { ROUTES } from './utils/constants.js'
import { hydrateAuthFromStorage } from './services/authService.js'
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
import { createNavbar, bindNavbarActions } from './components/layout/Navbar.js'
import { setSafeText } from './utils/dom.js'

// Crée le shell principal avec navbar commune.
const createPage = (title = '') => {
  const el = document.createElement('main')
  el.className = 'min-h-screen bg-slate-900 p-8 text-white'

  const navbar = createNavbar()
  bindNavbarActions(navbar)
  el.append(navbar)

  if (title) {
    const heading = document.createElement('h1')
    heading.className = 'text-3xl font-bold'
    setSafeText(heading, title)
    el.append(heading)
  }

  return el
}

const updateCartBadges = () => {
  const count = getCartCount()
  document.querySelectorAll('[data-cart-count]').forEach((node) => {
    node.textContent = String(count)
  })
}

// Crée une page avec layout (navbar + contenu).
const withLayout = (contentFactory) => (routeContext = {}) => {
  const shell = createPage('')
  const title = shell.querySelector('h1')
  if (title) title.remove()
  shell.append(contentFactory(routeContext))
  return shell
}

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

window.addEventListener('cart:updated', updateCartBadges)

hydrateAuthFromStorage().finally(() => {
  initRouter()
})

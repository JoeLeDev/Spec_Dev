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
import { createNotFoundPage } from './pages/NotFoundPage.js'
import { getCartCount } from './services/cartService.js'
import { redirectIfAuthenticated, requireAuth } from './app/guards.js'
import { createAppShell } from './components/layout/appShell.js'

const updateCartBadges = () => {
  const count = getCartCount()
  document.querySelectorAll('[data-cart-count]').forEach((node) => {
    node.textContent = String(count)
  })
}

// Enveloppe une page avec navbar + footer.
const withLayout = (contentFactory) => (routeContext = {}) =>
  createAppShell(() => contentFactory(routeContext), { pathname: routeContext.pathname })

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
registerRoute('/404', withLayout(createNotFoundPage))

window.addEventListener('cart:updated', updateCartBadges)

hydrateAuthFromStorage().finally(() => {
  initRouter()
})

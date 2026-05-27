import './style.css'
import { initRouter, registerRoute } from './app/router.js'
import { ROUTES } from './utils/constants.js'
import { hydrateAuthFromStorage, logout } from './services/authService.js'
import { createLoginPage } from './pages/LoginPage.js'
import { createRegisterPage } from './pages/RegisterPage.js'
import { redirectIfAuthenticated, requireAuth } from './app/guards.js'

const createPage = (title) => {
  const el = document.createElement('main')
  el.className = 'min-h-screen bg-slate-900 p-8 text-white'
  el.innerHTML = `
    <nav class="mb-6 flex gap-4 text-sm">
    <a data-link href="${ROUTES.DASHBOARD}" class="text-indigo-300 hover:underline">Dashboard</a>
      <a data-link href="${ROUTES.PRODUCTS}" class="text-indigo-300 hover:underline">Produits</a>
      <a data-link href="${ROUTES.LOGIN}" class="text-indigo-300 hover:underline">Login</a>
      <a data-link href="${ROUTES.REGISTER}" class="text-indigo-300 hover:underline">Register</a>
      <button id="logout-btn" class="text-red-300 hover:underline">Logout</button>
    </nav>
    <h1 class="text-3xl font-bold">${title}</h1>
  `

  const logoutButton = el.querySelector('#logout-btn')
  logoutButton.addEventListener('click', async () => {
    await logout()
  })

  return el
}

registerRoute(ROUTES.LOGIN, redirectIfAuthenticated(createLoginPage))
registerRoute(ROUTES.REGISTER, redirectIfAuthenticated(createRegisterPage))
registerRoute(ROUTES.PRODUCTS, () => createPage('Produits'))
registerRoute(ROUTES.DASHBOARD, requireAuth(() => createPage('Dashboard')))
registerRoute('/404', () => createPage('404'))

hydrateAuthFromStorage()
initRouter()
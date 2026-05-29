import { logout, isAuthenticated } from '../../services/authService.js'
import { navigateTo } from '../../app/router.js'
import { ROUTES } from '../../utils/constants.js'
import { getCartCount } from '../../services/cartService.js'

// Crée un lien de navigation interne.
const createNavLink = (href, label) => {
  const link = document.createElement('a')
  link.setAttribute('data-link', 'true')
  link.href = href
  link.className = 'text-indigo-300 hover:underline'
  link.textContent = label
  return link
}

// Crée le lien panier avec compteur dynamique.
const createCartLink = () => {
  const link = document.createElement('a')
  link.setAttribute('data-link', 'true')
  link.href = ROUTES.CART
  link.className = 'text-indigo-300 hover:underline'
  link.append('Panier (')

  const countNode = document.createElement('span')
  countNode.setAttribute('data-cart-count', 'true')
  countNode.textContent = String(getCartCount())
  link.append(countNode, ')')

  return link
}

// Construit la barre de navigation principale.
export const createNavbar = () => {
  const navbar = document.createElement('nav')
  navbar.className = 'mb-6 flex flex-wrap items-center gap-4 text-sm'

  if (isAuthenticated()) {
    navbar.append(
      createNavLink(ROUTES.DASHBOARD, 'Dashboard'),
      createNavLink(ROUTES.CSP_REPORT, 'CSP')
    )

  navbar.append(createNavLink(ROUTES.PRODUCTS, 'Produits'), createCartLink(), createNavLink(ROUTES.STATS_CATEGORIES, 'Stats'))

    const logoutButton = document.createElement('button')
    logoutButton.id = 'logout-btn'
    logoutButton.type = 'button'
    logoutButton.className = 'text-red-300 hover:underline'
    logoutButton.textContent = 'Déconnexion'
    navbar.append(logoutButton)
  } else {
    navbar.append(createNavLink(ROUTES.LOGIN, 'Connexion'), createNavLink(ROUTES.REGISTER, 'Inscription'))
  }

  return navbar
}

// Branche les actions interactives de la navbar (logout).
export const bindNavbarActions = (navbar) => {
  const logoutButton = navbar.querySelector('#logout-btn')
  if (!logoutButton) return

  logoutButton.addEventListener('click', async () => {
    try {
      await logout()
    } catch {
      // Déconnexion locale non bloquante si l'API échoue.
    }
    navigateTo(ROUTES.LOGIN)
  })
}

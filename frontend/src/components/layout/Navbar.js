import { logout, isAuthenticated } from '../../services/authService.js'
import { navigateTo } from '../../app/router.js'
import { ROUTES } from '../../utils/constants.js'
import { getCartCount } from '../../services/cartService.js'

const ACTIVE_CLASSES = 'font-semibold text-white underline decoration-indigo-400'
const INACTIVE_CLASSES = 'text-indigo-300 hover:underline'

// Indique si un lien correspond à la route affichée.
const isNavLinkActive = (href, pathname) => {
  if (href === pathname) return true
  if (href === ROUTES.PRODUCTS && pathname.startsWith('/products')) return true
  if (href === ROUTES.STATS_CATEGORIES && pathname.startsWith('/stats')) return true
  return false
}

// Crée un lien de navigation interne.
const createNavLink = (href, label, pathname) => {
  const link = document.createElement('a')
  link.setAttribute('data-link', 'true')
  link.href = href
  link.textContent = label
  link.className = 'block py-1'

  if (isNavLinkActive(href, pathname)) {
    link.className += ` ${ACTIVE_CLASSES}`
    link.setAttribute('aria-current', 'page')
  } else {
    link.className += ` ${INACTIVE_CLASSES}`
  }

  return link
}

// Crée le lien panier avec compteur dynamique.
const createCartLink = (pathname) => {
  const link = document.createElement('a')
  link.setAttribute('data-link', 'true')
  link.href = ROUTES.CART
  link.className = 'block py-1'
  link.className += isNavLinkActive(ROUTES.CART, pathname) ? ` ${ACTIVE_CLASSES}` : ` ${INACTIVE_CLASSES}`
  if (isNavLinkActive(ROUTES.CART, pathname)) link.setAttribute('aria-current', 'page')
  link.append('Panier (')

  const countNode = document.createElement('span')
  countNode.setAttribute('data-cart-count', 'true')
  countNode.textContent = String(getCartCount())
  link.append(countNode, ')')

  return link
}

// Construit la barre de navigation principale.
export const createNavbar = (pathname = window.location.pathname) => {
  const navbar = document.createElement('nav')
  navbar.className = 'mb-4 w-full min-w-0 max-w-full border-b border-slate-700 pb-4'

  const headerRow = document.createElement('div')
  headerRow.className = 'flex items-center justify-between gap-2'

  const brand = document.createElement('span')
  brand.className = 'text-sm font-semibold tracking-wide text-slate-100'
  brand.textContent = 'Spec_Dev'

  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.id = 'nav-toggle'
  toggle.className =
    'rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-200 md:hidden'
  toggle.setAttribute('aria-controls', 'nav-menu')
  toggle.setAttribute('aria-expanded', 'false')
  toggle.textContent = 'Menu'

  headerRow.append(brand, toggle)

  const menu = document.createElement('div')
  menu.id = 'nav-menu'
  menu.className =
    'hidden w-full min-w-0 flex-col gap-1 pt-3 text-sm md:flex md:flex-row md:flex-wrap md:items-center md:gap-4 md:pt-0'

  const shopGroup = document.createElement('div')
  shopGroup.className = 'flex flex-col gap-1 md:flex-row md:flex-wrap md:items-center md:gap-4'
  shopGroup.append(
    createNavLink(ROUTES.PRODUCTS, 'Produits', pathname),
    createCartLink(pathname),
    createNavLink(ROUTES.STATS_CATEGORIES, 'Stats', pathname)
  )

  const sessionGroup = document.createElement('div')
  sessionGroup.className =
    'flex flex-col gap-1 border-t border-slate-700 pt-2 md:flex-row md:flex-wrap md:items-center md:gap-4 md:border-t-0 md:pt-0'

  if (isAuthenticated()) {
    sessionGroup.append(
      createNavLink(ROUTES.DASHBOARD, 'Dashboard', pathname),
      createNavLink(ROUTES.CSP_REPORT, 'CSP', pathname)
    )

    const logoutButton = document.createElement('button')
    logoutButton.id = 'logout-btn'
    logoutButton.type = 'button'
    logoutButton.className = 'block py-1 text-left text-red-300 hover:underline md:inline'
    logoutButton.textContent = 'Déconnexion'
    sessionGroup.append(logoutButton)
  } else {
    sessionGroup.append(
      createNavLink(ROUTES.LOGIN, 'Connexion', pathname),
      createNavLink(ROUTES.REGISTER, 'Inscription', pathname)
    )
  }

  menu.append(shopGroup, sessionGroup)

  toggle.addEventListener('click', () => {
    const isHidden = menu.classList.contains('hidden')
    menu.classList.toggle('hidden', !isHidden)
    menu.classList.toggle('flex', isHidden)
    toggle.setAttribute('aria-expanded', String(isHidden))
    toggle.textContent = isHidden ? 'Fermer' : 'Menu'
  })

  menu.addEventListener('click', (event) => {
    const link = event.target.closest('[data-link]')
    if (!link || window.innerWidth >= 768) return
    menu.classList.add('hidden')
    menu.classList.remove('flex')
    toggle.setAttribute('aria-expanded', 'false')
    toggle.textContent = 'Menu'
  })

  navbar.append(headerRow, menu)
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

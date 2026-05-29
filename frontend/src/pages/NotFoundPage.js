import { ROUTES } from '../utils/constants.js'
import { setSafeText } from '../utils/dom.js'

// Contenu de la page 404 (sans shell : enveloppé par withLayout).
export const createNotFoundPage = () => {
  const section = document.createElement('section')
  section.className = 'mx-auto max-w-lg space-y-4 text-center sm:text-left'

  const code = document.createElement('p')
  code.className = 'text-5xl font-bold text-indigo-400 sm:text-6xl'
  code.textContent = '404'

  const title = document.createElement('h2')
  title.className = 'text-xl font-semibold sm:text-2xl'
  setSafeText(title, 'Page introuvable')

  const message = document.createElement('p')
  message.className = 'text-slate-300'
  setSafeText(
    message,
    "L'URL demandée n'existe pas ou a été déplacée. Utilise les liens ci-dessous pour revenir sur le site."
  )

  const actions = document.createElement('div')
  actions.className = 'flex flex-wrap justify-center gap-3 sm:justify-start'

  const productsLink = document.createElement('a')
  productsLink.setAttribute('data-link', 'true')
  productsLink.href = ROUTES.PRODUCTS
  productsLink.className = 'rounded bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400'
  productsLink.textContent = 'Voir les produits'

  const homeLink = document.createElement('a')
  homeLink.setAttribute('data-link', 'true')
  homeLink.href = ROUTES.LOGIN
  homeLink.className = 'rounded border border-slate-600 px-4 py-2 text-sm hover:bg-slate-800'
  homeLink.textContent = 'Connexion'

  actions.append(productsLink, homeLink)
  section.append(code, title, message, actions)

  return section
}

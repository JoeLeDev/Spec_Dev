import { isAuthenticated } from '../services/authService.js'
import { ROUTES } from '../utils/constants.js'
import { navigateTo } from './router.js'


export const requireAuth = (renderPage) => () => {
  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated()) {
    navigateTo(ROUTES.LOGIN)
    return document.createElement('div')
  }

  return renderPage()
}

export const redirectIfAuthenticated = (renderPage) => () => {
  // Si l'utilisateur est authentifié, rediriger vers la page de produits
  if (isAuthenticated()) {
    navigateTo(ROUTES.PRODUCTS)
    return document.createElement('div')
  }

  return renderPage()
}

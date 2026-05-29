import { isAuthenticated } from '../services/authService.js'
import { ROUTES } from '../utils/constants.js'
import { navigateTo } from './router.js'


export const requireAuth = (renderPage) => (routeContext = {}) => {
  if (!isAuthenticated()) {
    navigateTo(ROUTES.LOGIN)
    return document.createElement('div')
  }

  return renderPage(routeContext)
}

export const redirectIfAuthenticated = (renderPage) => (routeContext = {}) => {
  if (isAuthenticated()) {
    navigateTo(ROUTES.PRODUCTS)
    return document.createElement('div')
  }

  return renderPage(routeContext)
}

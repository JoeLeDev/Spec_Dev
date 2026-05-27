import { isAuthenticated } from '../services/authService.js'
import { ROUTES } from '../utils/constants.js'
import { navigateTo } from './router.js'

export const requireAuth = (renderPage) => () => {
  if (!isAuthenticated()) {
    navigateTo(ROUTES.LOGIN)
    return document.createElement('div')
  }

  return renderPage()
}

export const redirectIfAuthenticated = (renderPage) => () => {
  if (isAuthenticated()) {
    navigateTo(ROUTES.PRODUCTS)
    return document.createElement('div')
  }

  return renderPage()
}

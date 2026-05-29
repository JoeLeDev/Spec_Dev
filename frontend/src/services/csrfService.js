import { apiRequest } from './apiClient.js'
import { STORAGE_KEYS } from '../utils/constants.js'

// Lit le token CSRF stocké localement.
export const getStoredCsrfToken = () => localStorage.getItem(STORAGE_KEYS.CSRF_TOKEN) ?? ''

// Sauvegarde ou supprime le token CSRF local.
export const setStoredCsrfToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.CSRF_TOKEN, token)
    return
  }
  localStorage.removeItem(STORAGE_KEYS.CSRF_TOKEN)
}

// Récupère le token CSRF depuis le backend (session cookie requise).
export const fetchCsrfToken = async () => {
  const data = await apiRequest('/csrf-token', { method: 'GET' })
  const token = data?.csrfToken ?? ''
  setStoredCsrfToken(token)
  return token
}

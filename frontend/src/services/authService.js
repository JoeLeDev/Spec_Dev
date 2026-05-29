import { apiRequest } from './apiClient.js'
import { fetchCsrfToken, setStoredCsrfToken } from './csrfService.js'
import { getState, setState } from '../app/store.js'

// Met à jour le store avec l'utilisateur connecté.
const saveSession = (user) => {
  setState((prevState) => ({
    ...prevState,
    auth: {
      isAuthenticated: Boolean(user),
      token: null,
      user: user ?? null,
    },
  }))
}

// Réinitialise l'état auth local.
const clearSession = () => {
  setStoredCsrfToken(null)

  setState((prevState) => ({
    ...prevState,
    auth: {
      isAuthenticated: false,
      token: null,
      user: null,
    },
  }))
}

// Inscription via POST /auth/register.
export const register = async ({ email, password }) => {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

// Connexion via POST /auth/login (cookie de session).
export const login = async ({ email, password }) => {
  const user = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  saveSession(user)
  await fetchCsrfToken()
  return user
}

// Déconnexion via POST /auth/logout.
export const logout = async () => {
  try {
    await apiRequest('/auth/logout', { method: 'POST' })
  } finally {
    clearSession()
  }
}

// Restaure la session en appelant GET /auth/me.
export const hydrateAuthFromSession = async () => {
  try {
    const user = await apiRequest('/auth/me', { method: 'GET' })
    saveSession(user)
    await fetchCsrfToken()
  } catch {
    clearSession()
  }
}

// Alias conservé pour compatibilité avec main.js existant.
export const hydrateAuthFromStorage = hydrateAuthFromSession

export const isAuthenticated = () => getState().auth.isAuthenticated

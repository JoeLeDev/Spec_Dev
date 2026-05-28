import { apiRequest } from './apiClient.js'
import { STORAGE_KEYS } from '../utils/constants.js'
import { getState, setState } from '../app/store.js'

const saveSession = ({ token, csrfToken, user }) => {
  if (token) localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
  if (csrfToken) localStorage.setItem(STORAGE_KEYS.CSRF_TOKEN, csrfToken)

  setState((prevState) => ({
    ...prevState,
    auth: {
      isAuthenticated: Boolean(token),
      token: token ?? null,
      user: user ?? null,
    },
  }))
}

const clearSession = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.CSRF_TOKEN)

  setState((prevState) => ({
    ...prevState,
    auth: {
      isAuthenticated: false,
      token: null,
      user: null,
    },
  }))
}

export const register = async ({ email, password }) => {
  return apiRequest('/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export const login = async ({ email, password }) => {
  const data = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  saveSession({
    token: data?.token,
    csrfToken: data?.csrfToken,
    user: data?.user,
  })

  return data
}

export const logout = async () => {
  try {
    await apiRequest('/logout', { method: 'POST' })
  } finally {
    clearSession()
  }
}

export const hydrateAuthFromStorage = () => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  const csrfToken = localStorage.getItem(STORAGE_KEYS.CSRF_TOKEN)

  if (!token) {
    clearSession()
    return
  }

  saveSession({
    token,
    csrfToken,
    user: getState().auth.user,
  })
}

export const isAuthenticated = () => getState().auth.isAuthenticated

import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants.js'

const buildHeaders = (customHeaders = {}) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  const csrfToken = localStorage.getItem(STORAGE_KEYS.CSRF_TOKEN)

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    ...customHeaders,
  }
}

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      (isJson && data?.message) || `Erreur HTTP ${response.status}`
    throw new Error(message)
  }

  return data
}

const toUserFriendlyError = (error) => {
  if (error?.name === 'AbortError') {
    return 'La requete a pris trop de temps. Reessaie.'
  }

  if (
    error instanceof TypeError &&
    String(error.message).toLowerCase().includes('failed to fetch')
  ) {
    return 'Impossible de joindre le serveur API. Verifie que le backend tourne sur localhost:5000 et que CORS est configure.'
  }

  return error?.message || 'Erreur reseau.'
}

export const apiRequest = async (path, options = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(options.headers),
      signal: controller.signal,
    })

    return await parseResponse(response)
  } catch (error) {
    throw new Error(toUserFriendlyError(error))
  } finally {
    clearTimeout(timeoutId)
  }
}
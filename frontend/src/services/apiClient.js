import { API_BASE_URL } from '../utils/constants.js'

// Construit les en-tetes HTTP communs (session cookie + CSRF optionnel).
const buildHeaders = (customHeaders = {}) => {
  const csrfToken = localStorage.getItem('csrf_token')

  return {
    'Content-Type': 'application/json',
    ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    ...customHeaders,
  }
}

// Extrait un message d erreur lisible depuis la reponse API.
const extractErrorMessage = (data, status) => {
  if (!data || typeof data !== 'object') return `Erreur HTTP ${status}`

  if (data.erreur && Array.isArray(data.details) && data.details.length) {
    return `${data.erreur} (${data.details.join(', ')})`
  }

  return data.erreur || data.message || `Erreur HTTP ${status}`
}

// Parse la reponse HTTP et leve une erreur si necessaire.
const parseResponse = async (response) => {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message = isJson
      ? extractErrorMessage(data, response.status)
      : `Erreur HTTP ${response.status}`
    throw new Error(message)
  }

  return data
}

// Traduit les erreurs techniques en messages utilisateur.
const toUserFriendlyError = (error) => {
  if (error?.name === 'AbortError') {
    return 'La requete a pris trop de temps. Reessaie.'
  }

  if (
    error instanceof TypeError &&
    String(error.message).toLowerCase().includes('failed to fetch')
  ) {
    return 'Impossible de joindre le serveur API. Verifie que le backend tourne sur localhost:3000 et que le front est sur localhost:5173.'
  }

  return error?.message || 'Erreur reseau.'
}

// Execute une requete API avec cookies de session (credentials).
export const apiRequest = async (path, options = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
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

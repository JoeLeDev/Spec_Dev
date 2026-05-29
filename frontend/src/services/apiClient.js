import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants.js'

// Construit les en-têtes HTTP communs (session cookie + CSRF optionnel).
const buildHeaders = (customHeaders = {}, { json = true } = {}) => {
  const csrfToken = localStorage.getItem(STORAGE_KEYS.CSRF_TOKEN)

  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
    ...customHeaders,
  }
}

// Extrait un message d'erreur lisible depuis la réponse API.
const extractErrorMessage = (data, status) => {
  if (!data || typeof data !== 'object') return `Erreur HTTP ${status}`

  if (data.erreur && Array.isArray(data.details) && data.details.length) {
    return `${data.erreur} (${data.details.join(', ')})`
  }

  return data.erreur || data.message || `Erreur HTTP ${status}`
}

// Parse la réponse HTTP et lève une erreur si nécessaire.
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
    return 'La requête a pris trop de temps. Réessaie.'
  }

  if (
    error instanceof TypeError &&
    String(error.message).toLowerCase().includes('failed to fetch')
  ) {
    return 'Impossible de joindre le serveur API. Vérifie que le backend tourne sur localhost:3000 et que le front est sur localhost:5173.'
  }

  return error?.message || 'Erreur réseau.'
}

// Exécute une requête API avec cookies de session (credentials).
export const apiRequest = async (path, options = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  try {
    const isFormData = options.body instanceof FormData
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: buildHeaders(options.headers, { json: !isFormData }),
      signal: controller.signal,
    })

    return await parseResponse(response)
  } catch (error) {
    throw new Error(toUserFriendlyError(error))
  } finally {
    clearTimeout(timeoutId)
  }
}

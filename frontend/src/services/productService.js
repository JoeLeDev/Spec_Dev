import { apiRequest } from './apiClient.js'
import { MOCK_STORAGE_KEYS } from '../utils/constants.js'

const MOCK_PRODUCTS = [
  {
    id: '1',
    label: 'Clavier mécanique',
    description: 'Clavier compact switchs rouges.',
    price: 89.9,
    category: 'Informatique',
    images: [],
  },
  {
    id: '2',
    label: 'Lampe de bureau LED',
    description: 'Intensite reglable et port USB.',
    price: 29.5,
    category: 'Maison',
    images: [],
  },
  {
    id: '3',
    label: 'Tapis de yoga',
    description: 'Surface antidérapante 6mm.',
    price: 24.99,
    category: 'Sport',
    images: [],
  },
]

const MOCK_CATEGORY_STATS = [
  { nom: 'Informatique', compte: 1 },
  { nom: 'Maison', compte: 1 },
  { nom: 'Sport', compte: 1 },
]

// Indique si l'erreur provient d'un problème réseau (backend injoignable).
const isNetworkError = (error) => {
  const message = String(error?.message ?? '').toLowerCase()
  return (
    error instanceof TypeError ||
    message.includes('joindre le serveur') ||
    message.includes('erreur réseau')
  )
}

// Convertit un produit API (libellé/prix/catégorie) vers le modèle front.
export const mapProductFromApi = (product) => ({
  id: product.id,
  label: product.libelle ?? product.label ?? 'Produit',
  description: product.description ?? '',
  price: Number(product.prix ?? product.price ?? 0),
  category: product.categorie ?? product.category ?? 'N/A',
  images: product.images ?? [],
})

// Convertit un payload front vers le format API backend.
export const mapProductToApi = (payload) => ({
  libelle: payload.label,
  description: payload.description,
  prix: Number(payload.price),
  categorie: payload.category,
})

// Lit un fichier image en data URL (fallback mock hors ligne).
const readImageFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Impossible de lire le fichier image.'))
    reader.readAsDataURL(file)
  })

// Construit un FormData pour creer ou modifier un produit avec image.
const buildProductFormData = (payload) => {
  const formData = new FormData()
  formData.append('libelle', payload.label)
  formData.append('description', payload.description)
  formData.append('prix', String(payload.price))
  formData.append('categorie', payload.category)

  if (payload.imageFile) {
    formData.append('image', payload.imageFile)
  }

  return formData
}

// Lit la liste locale des produits mockes.
const readMockProducts = () => {
  const raw = localStorage.getItem(MOCK_STORAGE_KEYS.PRODUCTS)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

// Sauvegarde la liste locale des produits mockes.
const writeMockProducts = (products) => {
  localStorage.setItem(MOCK_STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
}

// Retourne la source produits utilisée en fallback (mock local ou seed).
const getLocalProducts = () => readMockProducts() ?? structuredClone(MOCK_PRODUCTS)

// Pour récupérer tous les produits
export const getProducts = async () => {
  try {
    const data = await apiRequest('/products', { method: 'GET' })
    if (Array.isArray(data)) return data.map(mapProductFromApi)
    return getLocalProducts()
  } catch (error) {
    if (isNetworkError(error)) return getLocalProducts()
    throw error
  }
}

// Pour rechercher des produits par label, description ou catégorie
export const searchProducts = (products, query) => {
  const value = query.trim().toLowerCase()
  if (!value) return products

  return products.filter((product) => {
    const label = String(product.label ?? '').toLowerCase()
    const description = String(product.description ?? '').toLowerCase()
    const category = String(product.category ?? '').toLowerCase()
    return (
      label.includes(value) ||
      description.includes(value) ||
      category.includes(value)
    )
  })
}

// Pour récupérer un produit par son id
export const getProductById = async (productId) => {
  if (!productId || productId === 'new') return null

  try {
    const data = await apiRequest(`/products/${productId}`, { method: 'GET' })
    if (data && typeof data === 'object') return mapProductFromApi(data)
  } catch (error) {
    if (!isNetworkError(error)) throw error
  }

  const products = await getProducts()
  return products.find((product) => String(product.id) === String(productId)) ?? null
}

// Pour créer un produit via l'API (fallback mock uniquement si réseau down)
export const createProduct = async (payload) => {
  const hasImage = Boolean(payload.imageFile)

  try {
    const data = await apiRequest('/products', {
      method: 'POST',
      body: hasImage ? buildProductFormData(payload) : JSON.stringify(mapProductToApi(payload)),
    })
    if (data && typeof data === 'object') return mapProductFromApi(data)
    throw new Error('Réponse API invalide lors de la création.')
  } catch (error) {
    if (!isNetworkError(error)) throw error
  }

  const products = await getProducts()
  const images = payload.imageFile
    ? [{ url: await readImageFileAsDataUrl(payload.imageFile) }]
    : []

  const created = {
    id: String(Date.now()),
    label: payload.label,
    description: payload.description,
    price: Number(payload.price),
    category: payload.category,
    images,
  }
  writeMockProducts([...products, created])
  return created
}

// Pour mettre à jour un produit via l'API
export const updateProduct = async (productId, payload) => {
  const hasImage = Boolean(payload.imageFile)

  try {
    const data = await apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: hasImage ? buildProductFormData(payload) : JSON.stringify(mapProductToApi(payload)),
    })
    if (data && typeof data === 'object') return mapProductFromApi(data)
    throw new Error('Réponse API invalide lors de la mise à jour.')
  } catch (error) {
    if (!isNetworkError(error)) throw error
  }

  const products = await getProducts()
  let nextImages = null

  if (payload.imageFile) {
    nextImages = [{ url: await readImageFileAsDataUrl(payload.imageFile) }]
  }

  const updated = products.map((product) =>
    String(product.id) === String(productId)
      ? {
          ...product,
          label: payload.label,
          description: payload.description,
          price: Number(payload.price),
          category: payload.category,
          ...(nextImages ? { images: nextImages } : {}),
        }
      : product
  )
  writeMockProducts(updated)
  return updated.find((product) => String(product.id) === String(productId)) ?? null
}

// Pour supprimer un produit via l'API
export const deleteProduct = async (productId) => {
  try {
    await apiRequest(`/products/${productId}`, { method: 'DELETE' })
    return true
  } catch (error) {
    if (!isNetworkError(error)) throw error
  }

  const products = await getProducts()
  const updated = products.filter((product) => String(product.id) !== String(productId))
  writeMockProducts(updated)
  return true
}

// Pour récupérer les statistiques de catégories
export const getCategoryStats = async () => {
  try {
    const data = await apiRequest('/stats', { method: 'GET' })
    if (Array.isArray(data)) return data
    return MOCK_CATEGORY_STATS
  } catch (error) {
    if (isNetworkError(error)) return MOCK_CATEGORY_STATS
    throw error
  }
}

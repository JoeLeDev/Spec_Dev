import { apiRequest } from './apiClient.js'
import { MOCK_STORAGE_KEYS } from '../utils/constants.js'

const MOCK_PRODUCTS = [
  {
    id: 1,
    label: 'Clavier mecanique',
    description: 'Clavier compact switchs rouges.',
    price: 89.9,
    category: 'Informatique',
  },
  {
    id: 2,
    label: 'Lampe de bureau LED',
    description: 'Intensite reglable et port USB.',
    price: 29.5,
    category: 'Maison',
  },
  {
    id: 3,
    label: 'Tapis de yoga',
    description: 'Surface antiderapante 6mm.',
    price: 24.99,
    category: 'Sport',
  },
]

const MOCK_CATEGORY_STATS = [
  { nom: 'Informatique', compte: 1 },
  { nom: 'Maison', compte: 1 },
  { nom: 'Sport', compte: 1 },
]

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

// Retourne la source produits utilisee en fallback (mock local ou seed).
const getLocalProducts = () => readMockProducts() ?? structuredClone(MOCK_PRODUCTS)

// Pour recuperer tous les produits
export const getProducts = async () => {
  try {
    const data = await apiRequest('/products', { method: 'GET' })
    if (Array.isArray(data)) return data
    return getLocalProducts()
  } catch {
    return getLocalProducts()
  }
}

// Pour rechercher des produits par label, description ou categorie
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

// Pour recuperer un produit par son id
export const getProductById = async (productId) => {
  if (!productId || productId === 'new') return null

  try {
    const data = await apiRequest(`/products/${productId}`, { method: 'GET' })
    if (data && typeof data === 'object') return data
  } catch {
    // Fallback local ci-dessous.
  }

  const products = await getProducts()
  return products.find((product) => Number(product.id) === Number(productId)) ?? null
}

// Pour creer un produit (API puis fallback local)
export const createProduct = async (payload) => {
  try {
    const data = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (data && typeof data === 'object') return data
  } catch {
    // Fallback local ci-dessous.
  }

  const products = await getProducts()
  const created = {
    ...payload,
    id: Date.now(),
    price: Number(payload.price),
  }
  writeMockProducts([...products, created])
  return created
}

// Pour mettre a jour un produit (API puis fallback local)
export const updateProduct = async (productId, payload) => {
  try {
    const data = await apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    if (data && typeof data === 'object') return data
  } catch {
    // Fallback local ci-dessous.
  }

  const products = await getProducts()
  const updated = products.map((product) =>
    Number(product.id) === Number(productId)
      ? { ...product, ...payload, id: Number(productId), price: Number(payload.price) }
      : product
  )
  writeMockProducts(updated)
  return updated.find((product) => Number(product.id) === Number(productId)) ?? null
}

// Pour supprimer un produit (API puis fallback local)
export const deleteProduct = async (productId) => {
  try {
    await apiRequest(`/products/${productId}`, { method: 'DELETE' })
    return true
  } catch {
    // Fallback local ci-dessous.
  }

  const products = await getProducts()
  const updated = products.filter((product) => Number(product.id) !== Number(productId))
  writeMockProducts(updated)
  return true
}

// Pour recuperer les statistiques de categories (API puis fallback local)
export const getCategoryStats = async () => {
  try {
    const data = await apiRequest('/stats/categories', { method: 'GET' })
    if (Array.isArray(data)) return data
    return MOCK_CATEGORY_STATS
  } catch {
    return MOCK_CATEGORY_STATS
  }
}

import { apiRequest } from './apiClient.js'

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

// Pour récupérer tous les produits
export const getProducts = async () => {
  try {
    const data = await apiRequest('/products', { method: 'GET' })
    if (Array.isArray(data)) return data
    return MOCK_PRODUCTS
  } catch {
    return MOCK_PRODUCTS
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

// Pour récupérer un produit par son id
export const getProductById = async (productId) => {
  try {
    const data = await apiRequest(`/products/${productId}`, { method: 'GET' })
    if (data && typeof data === 'object') return data
  } catch {
    // Fallback handled below.
  }

  const products = await getProducts()
  return products.find((product) => Number(product.id) === Number(productId)) ?? null
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

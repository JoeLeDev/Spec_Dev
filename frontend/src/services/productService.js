import { apiRequest } from './apiClient.js'

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

// Construit un FormData pour creer ou modifier un produit avec images.
const buildProductFormData = (payload) => {
  const formData = new FormData()
  formData.append('libelle', payload.label)
  formData.append('description', payload.description)
  formData.append('prix', String(payload.price))
  formData.append('categorie', payload.category)

  const imageFiles = payload.imageFiles ?? []
  imageFiles.forEach((file) => {
    formData.append('images', file)
  })

  return formData
}

// Pour récupérer tous les produits
export const getProducts = async () => {
  const data = await apiRequest('/products', { method: 'GET' })
  if (!Array.isArray(data)) {
    throw new Error('Réponse API invalide pour la liste des produits.')
  }
  return data.map(mapProductFromApi)
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

  const data = await apiRequest(`/products/${productId}`, { method: 'GET' })
  if (data && typeof data === 'object') return mapProductFromApi(data)
  return null
}

// Pour créer un produit via l'API
export const createProduct = async (payload) => {
  const hasImages = Boolean(payload.imageFiles?.length)
  const data = await apiRequest('/products', {
    method: 'POST',
    body: hasImages ? buildProductFormData(payload) : JSON.stringify(mapProductToApi(payload)),
  })

  if (data && typeof data === 'object') return mapProductFromApi(data)
  throw new Error('Réponse API invalide lors de la création.')
}

// Pour mettre à jour un produit via l'API
export const updateProduct = async (productId, payload) => {
  const hasImages = Boolean(payload.imageFiles?.length)
  const data = await apiRequest(`/products/${productId}`, {
    method: 'PUT',
    body: hasImages ? buildProductFormData(payload) : JSON.stringify(mapProductToApi(payload)),
  })

  if (data && typeof data === 'object') return mapProductFromApi(data)
  throw new Error('Réponse API invalide lors de la mise à jour.')
}

// Pour supprimer un produit via l'API
export const deleteProduct = async (productId) => {
  await apiRequest(`/products/${productId}`, { method: 'DELETE' })
  return true
}

// Pour récupérer les statistiques de catégories
export const getCategoryStats = async () => {
  const data = await apiRequest('/stats', { method: 'GET' })
  if (!Array.isArray(data)) {
    throw new Error('Réponse API invalide pour les statistiques.')
  }
  return data
}

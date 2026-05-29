import { API_BASE_URL } from './constants.js'
import { setSafeText } from './dom.js'

// Valide et normalise une URL d'image renvoyée par l'API.
export const resolveImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null

  const url = rawUrl.trim()
  if (url.startsWith('data:image/')) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`
  if (url.startsWith('uploads/')) return `${API_BASE_URL}/${url}`

  return null
}

// Retourne l'URL de la première image d'un produit.
export const getPrimaryImageUrl = (product) => {
  const images = product?.images ?? []
  if (!images.length) return null

  const first = images[0]
  const candidate = typeof first === 'string' ? first : first?.url
  return resolveImageUrl(candidate)
}

// Crée un placeholder visuel si l'image est absente ou invalide.
export const createImagePlaceholder = () => {
  const placeholder = document.createElement('div')
  placeholder.className =
    'flex h-36 items-center justify-center rounded border border-dashed border-slate-600 bg-slate-900 text-xs text-slate-400'
  setSafeText(placeholder, 'Aucune image')
  return placeholder
}

// Ajoute une image produit sécurisée (src validée, alt texte).
export const appendProductImage = (
  container,
  product,
  className = 'mb-3 h-36 w-full rounded object-cover'
) => {
  const url = getPrimaryImageUrl(product)
  if (!url) {
    container.prepend(createImagePlaceholder())
    return null
  }

  const img = document.createElement('img')
  img.className = className
  img.loading = 'lazy'
  img.alt = product.label ?? 'Image produit'
  img.src = url
  img.addEventListener('error', () => {
    img.replaceWith(createImagePlaceholder())
  })

  container.prepend(img)
  return img
}

// Crée une galerie d'images pour la page détail.
export const appendProductGallery = (container, product) => {
  const images = product?.images ?? []
  if (!images.length) {
    container.append(createImagePlaceholder())
    return
  }

  const gallery = document.createElement('div')
  gallery.className = 'mb-4 grid gap-2 sm:grid-cols-2'

  images.forEach((imageItem, index) => {
    const candidate = typeof imageItem === 'string' ? imageItem : imageItem?.url
    const url = resolveImageUrl(candidate)
    if (!url) return

    const img = document.createElement('img')
    img.className = 'h-40 w-full rounded border border-slate-600 object-cover'
    img.loading = 'lazy'
    img.alt = `${product.label ?? 'Produit'} - image ${index + 1}`
    img.src = url
    img.addEventListener('error', () => img.remove())
    gallery.append(img)
  })

  if (!gallery.children.length) {
    container.append(createImagePlaceholder())
    return
  }

  container.append(gallery)
}

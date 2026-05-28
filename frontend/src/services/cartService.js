import { STORAGE_KEYS } from '../utils/constants.js'

const readCart = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.CART)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveCart = (items) => {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items))
}

export const getCartItems = () => readCart()

export const getCartCount = () =>
  readCart().reduce((total, item) => total + Number(item.quantity ?? 0), 0)

export const addToCart = (product) => {
  const items = readCart()
  const productId = Number(product.id)
  const index = items.findIndex((item) => Number(item.id) === productId)

  if (index >= 0) {
    const updated = items.map((item, itemIndex) =>
      itemIndex === index
        ? { ...item, quantity: Number(item.quantity ?? 1) + 1 }
        : item
    )
    saveCart(updated)
    return updated
  }

  const created = [...items, { ...product, quantity: 1 }]
  saveCart(created)
  return created
}

export const removeFromCart = (productId) => {
  const updated = readCart().filter((item) => Number(item.id) !== Number(productId))
  saveCart(updated)
  return updated
}

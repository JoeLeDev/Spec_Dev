import {
  clearCart,
  getCartItems,
  removeFromCart,
  updateCartItemQuantity,
} from '../services/cartService.js'
import { clearElement, setSafeText } from '../utils/dom.js'

const computeTotal = (items) =>
  items.reduce(
    (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 0),
    0
  )

export const createCartPage = () => {
  const page = document.createElement('section')
  page.className = 'space-y-4'

  const heading = document.createElement('h1')
  heading.className = 'text-3xl font-bold'
  heading.textContent = 'Panier'

  const list = document.createElement('div')
  list.className = 'space-y-3'

  const total = document.createElement('p')
  total.className = 'text-lg font-semibold text-indigo-300'

  const clearButton = document.createElement('button')
  clearButton.className = 'rounded bg-slate-700 px-3 py-2 text-sm hover:bg-slate-600'
  clearButton.textContent = 'Vider le panier'

  const render = () => {
    const items = getCartItems()
    clearElement(list)

    if (items.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'text-slate-300'
      empty.textContent = 'Ton panier est vide.'
      list.append(empty)
      total.textContent = 'Total: 0.00 EUR'
      return
    }

    items.forEach((item) => {
      const row = document.createElement('article')
      row.className =
        'flex flex-col gap-3 rounded border border-slate-700 bg-slate-800 p-3 sm:flex-row sm:items-center sm:justify-between'

      const info = document.createElement('p')
      info.className = 'text-sm'
      setSafeText(info, `${item.label} x${item.quantity} - ${Number(item.price).toFixed(2)} EUR`)

      const quantityControls = document.createElement('div')
      quantityControls.className = 'flex items-center gap-2'

      const minusButton = document.createElement('button')
      minusButton.className = 'rounded bg-slate-700 px-2 py-1 text-sm hover:bg-slate-600'
      minusButton.textContent = '-'
      minusButton.addEventListener('click', () => {
        updateCartItemQuantity(item.id, Number(item.quantity) - 1)
        render()
      })

      const quantity = document.createElement('span')
      quantity.className = 'min-w-8 text-center text-sm font-semibold'
      quantity.textContent = String(item.quantity)

      const plusButton = document.createElement('button')
      plusButton.className = 'rounded bg-slate-700 px-2 py-1 text-sm hover:bg-slate-600'
      plusButton.textContent = '+'
      plusButton.addEventListener('click', () => {
        updateCartItemQuantity(item.id, Number(item.quantity) + 1)
        render()
      })

      quantityControls.append(minusButton, quantity, plusButton)

      const removeButton = document.createElement('button')
      removeButton.className = 'rounded bg-red-500 px-3 py-1 text-sm hover:bg-red-400'
      removeButton.textContent = 'Retirer'
      removeButton.addEventListener('click', () => {
        removeFromCart(item.id)
        render()
      })

      const actions = document.createElement('div')
      actions.className = 'flex items-center gap-2'
      actions.append(quantityControls, removeButton)

      row.append(info, actions)
      list.append(row)
    })

    total.textContent = `Total: ${computeTotal(items).toFixed(2)} EUR`
  }

  clearButton.addEventListener('click', () => {
    clearCart()
    render()
  })

  render()
  page.append(heading, clearButton, list, total)
  return page
}

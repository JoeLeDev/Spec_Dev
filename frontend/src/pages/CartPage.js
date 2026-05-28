import { getCartItems, removeFromCart } from '../services/cartService.js'

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

  const render = () => {
    const items = getCartItems()
    list.innerHTML = ''

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
        'flex items-center justify-between rounded border border-slate-700 bg-slate-800 p-3'

      const info = document.createElement('p')
      info.className = 'text-sm'
      info.textContent = `${item.label} x${item.quantity} - ${Number(item.price).toFixed(2)} EUR`

      const removeButton = document.createElement('button')
      removeButton.className = 'rounded bg-red-500 px-3 py-1 text-sm hover:bg-red-400'
      removeButton.textContent = 'Retirer'
      removeButton.addEventListener('click', () => {
        removeFromCart(item.id)
        render()
      })

      row.append(info, removeButton)
      list.append(row)
    })

    total.textContent = `Total: ${computeTotal(items).toFixed(2)} EUR`
  }

  render()
  page.append(heading, list, total)
  return page
}

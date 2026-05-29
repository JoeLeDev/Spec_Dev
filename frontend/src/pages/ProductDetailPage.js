import { addToCart } from '../services/cartService.js'
import { deleteProduct, getProductById } from '../services/productService.js'
import { isAuthenticated } from '../services/authService.js'
import { ROUTES } from '../utils/constants.js'
import { navigateTo } from '../app/router.js'
import { appendProductGallery } from '../utils/productImages.js'
import { clearElement, setSafeText } from '../utils/dom.js'

// Cree la page de detail produit.
export const createProductDetailPage = ({ params }) => {
  const page = document.createElement('section')
  page.className = 'space-y-4'

  const title = document.createElement('h1')
  title.className = 'text-3xl font-bold'
  setSafeText(title, 'Detail produit')

  const content = document.createElement('div')
  content.className = 'rounded-lg border border-slate-700 bg-slate-800 p-4'
  setSafeText(content, 'Chargement...')

  const feedback = document.createElement('p')
  feedback.className = 'text-sm text-emerald-300'
  feedback.setAttribute('aria-live', 'polite')

  const productId = params?.id

  getProductById(productId)
    .then((product) => {
      if (!product) {
        clearElement(content)
        setSafeText(content, 'Produit introuvable.')
        return
      }

      clearElement(content)
      appendProductGallery(content, product)

      const label = document.createElement('h2')
      label.className = 'text-xl font-semibold'
      setSafeText(label, product.label ?? 'Produit')

      const category = document.createElement('p')
      category.className = 'text-sm text-slate-300'
      setSafeText(category, `Categorie: ${product.category ?? 'N/A'}`)

      const description = document.createElement('p')
      description.className = 'mt-3 text-slate-200'
      setSafeText(description, product.description ?? '')

      const price = document.createElement('p')
      price.className = 'mt-3 text-lg font-bold text-indigo-300'
      setSafeText(price, `${Number(product.price ?? 0).toFixed(2)} EUR`)

      const button = document.createElement('button')
      button.className =
        'mt-4 rounded bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400'
      button.textContent = 'Ajouter au panier'
      button.addEventListener('click', () => {
        addToCart(product)
        setSafeText(feedback, `${product.label} ajoute au panier.`)
      })

      content.append(label, category, description, price, button)

      if (isAuthenticated()) {
        const adminRow = document.createElement('div')
        adminRow.className = 'mt-4 flex gap-3'

        const editLink = document.createElement('a')
        editLink.setAttribute('data-link', 'true')
        editLink.href = `/products/${product.id}/edit`
        editLink.className = 'text-sm text-amber-300 hover:underline'
        editLink.textContent = 'Modifier'

        const deleteButton = document.createElement('button')
        deleteButton.className = 'text-sm text-red-300 hover:underline'
        deleteButton.textContent = 'Supprimer'
        deleteButton.addEventListener('click', async () => {
          const confirmed = window.confirm(`Supprimer "${product.label}" ?`)
          if (!confirmed) return
          await deleteProduct(product.id)
          navigateTo(ROUTES.PRODUCTS)
        })

        adminRow.append(editLink, deleteButton)
        content.append(adminRow)
      }
    })
    .catch((error) => {
      clearElement(content)
      setSafeText(content, error.message || 'Impossible de charger ce produit.')
    })

  page.append(title, content, feedback)
  return page
}

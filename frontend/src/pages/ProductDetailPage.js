import { addToCart } from '../services/cartService.js'
import { deleteProduct, getProductById } from '../services/productService.js'
import { isAuthenticated } from '../services/authService.js'
import { ROUTES } from '../utils/constants.js'
import { navigateTo } from '../app/router.js'

// Création de la page de détail du produit
export const createProductDetailPage = ({ params }) => {
  const page = document.createElement('section')
  page.className = 'space-y-4'

  const title = document.createElement('h1')
  title.className = 'text-3xl font-bold'
  title.textContent = 'Detail produit'

  const content = document.createElement('div')
  content.className = 'rounded-lg border border-slate-700 bg-slate-800 p-4'
  content.textContent = 'Chargement...'

  const feedback = document.createElement('p')
  feedback.className = 'text-sm text-emerald-300'
  feedback.setAttribute('aria-live', 'polite')

  // Récupération de l'id du produit
  const productId = params?.id
  // Récupération du produit par son id
  getProductById(productId)
    .then((product) => {
      if (!product) {
        content.textContent = 'Produit introuvable.'
        return
      }

      content.innerHTML = ''

      const label = document.createElement('h2')
      label.className = 'text-xl font-semibold'
      label.textContent = product.label ?? 'Produit'

      const category = document.createElement('p')
      category.className = 'text-sm text-slate-300'
      category.textContent = `Categorie: ${product.category ?? 'N/A'}`

      const description = document.createElement('p')
      description.className = 'mt-3 text-slate-200'
      description.textContent = product.description ?? ''

      const price = document.createElement('p')
      price.className = 'mt-3 text-lg font-bold text-indigo-300'
      price.textContent = `${Number(product.price ?? 0).toFixed(2)} EUR`

      const button = document.createElement('button')
      button.className =
        'mt-4 rounded bg-indigo-500 px-4 py-2 text-sm font-semibold hover:bg-indigo-400'
      button.textContent = 'Ajouter au panier'
      button.addEventListener('click', () => {
        addToCart(product)
        feedback.textContent = `${product.label} ajoute au panier.`
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
    .catch(() => {
      content.textContent = 'Impossible de charger ce produit.'
    })

  page.append(title, content, feedback)
  return page
}

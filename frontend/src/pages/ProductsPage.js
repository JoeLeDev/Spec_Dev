import { getProducts, searchProducts, deleteProduct } from '../services/productService.js'
import { addToCart } from '../services/cartService.js'
import { isAuthenticated } from '../services/authService.js'
import { ROUTES } from '../utils/constants.js'
import { appendProductImage } from '../utils/productImages.js'
import { setSafeText } from '../utils/dom.js'
import { clearElement } from '../utils/dom.js'

// Création de la carte de produit
const createProductCard = (product, onAdd, onDeleted, showAdminActions) => {
  const card = document.createElement('article')
  card.className = 'rounded-lg border border-slate-700 bg-slate-800 p-4'

  appendProductImage(card, product)

  const title = document.createElement('h3')
  title.className = 'text-lg font-semibold'
  setSafeText(title, product.label ?? 'Produit')

  const category = document.createElement('p')
  category.className = 'mt-1 text-xs text-slate-300'
  setSafeText(category, `Catégorie : ${product.category ?? 'N/A'}`)

  const description = document.createElement('p')
  description.className = 'mt-3 text-sm text-slate-200'
  setSafeText(description, product.description ?? '')

  const footer = document.createElement('div')
  footer.className = 'mt-4 flex items-center justify-between'

  const price = document.createElement('p')
  price.className = 'font-bold text-indigo-300'
  price.textContent = `${Number(product.price ?? 0).toFixed(2)} EUR`

  const button = document.createElement('button')
  button.className =
    'rounded bg-indigo-500 px-3 py-2 text-sm font-semibold hover:bg-indigo-400'
  button.textContent = 'Ajouter au panier'
  button.addEventListener('click', () => onAdd(product))

  const detailLink = document.createElement('a')
  detailLink.setAttribute('data-link', 'true')
  detailLink.href = `/products/${product.id}`
  detailLink.className = 'text-sm text-indigo-300 hover:underline'
  detailLink.textContent = 'Voir détail'

  const actions = document.createElement('div')
  actions.className = 'flex flex-wrap items-center gap-3'
  actions.append(detailLink, button)

  if (showAdminActions) {
    const editLink = document.createElement('a')
    editLink.setAttribute('data-link', 'true')
    editLink.href = `/products/${product.id}/edit`
    editLink.className = 'text-sm text-amber-300 hover:underline'
    editLink.textContent = 'Modifier'

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'text-sm text-red-300 hover:underline'
    deleteButton.textContent = 'Supprimer'
    deleteButton.addEventListener('click', async () => {
      const confirmed = window.confirm(`Supprimer "${product.label}" ?`)
      if (!confirmed) return
      await deleteProduct(product.id)
      onDeleted()
    })

    actions.append(editLink, deleteButton)
  }

  footer.append(price, actions)
  card.append(title, category, description, footer)
  return card
}

// Création de la page des produits
export const createProductsPage = () => {
  const page = document.createElement('section')
  page.className = 'space-y-4'

  const heading = document.createElement('h1')
  heading.className = 'text-3xl font-bold'
  heading.textContent = 'Produits'

  const toolbar = document.createElement('div')
  toolbar.className = 'flex flex-col gap-2 sm:flex-row sm:items-center'

  const input = document.createElement('input')
  input.type = 'search'
  input.placeholder = 'Rechercher un produit'
  input.className =
    'w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-sm sm:max-w-sm'

  const feedback = document.createElement('p')
  feedback.className = 'text-sm text-emerald-300'
  feedback.setAttribute('aria-live', 'polite')

  const adminActions = document.createElement('div')
  adminActions.className = 'flex gap-3'

  toolbar.append(input, adminActions)

  const grid = document.createElement('div')
  grid.className = 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'

  let products = []
  const canManage = isAuthenticated()

  if (canManage) {
    const newLink = document.createElement('a')
    newLink.setAttribute('data-link', 'true')
    newLink.href = ROUTES.PRODUCT_NEW
    newLink.className = 'rounded bg-emerald-500 px-3 py-2 text-sm font-semibold hover:bg-emerald-400'
    newLink.textContent = 'Nouveau produit'
    adminActions.append(newLink)
  }

  // Fonction pour afficher la liste des produits
  const renderList = (query = '') => {
    const filtered = searchProducts(products, query)
    clearElement(grid)

    if (filtered.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'text-sm text-slate-300'
      setSafeText(empty, 'Aucun produit trouvé.')
      grid.append(empty)
      return
    }

    filtered.forEach((product) => {
      const card = createProductCard(
        product,
        (selectedProduct) => {
          addToCart(selectedProduct)
          setSafeText(feedback, `${selectedProduct.label} ajouté au panier.`)
        },
        async () => {
          products = await getProducts()
          renderList(input.value)
        },
        canManage
      )
      grid.append(card)
    })
  }

  // Gestion de l'événement input lors de la recherche des produits
  input.addEventListener('input', () => renderList(input.value))

  // Récupération des produits
  getProducts()
    .then((data) => {
      products = data
      renderList()
    })
    .catch(() => {
      const error = document.createElement('p')
      error.className = 'text-sm text-red-400'
      setSafeText(error, 'Impossible de charger les produits.')
      clearElement(grid)
      grid.append(error)
    })

  page.append(heading, toolbar, feedback, grid)
  return page
}

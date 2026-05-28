import { getProducts, searchProducts } from '../services/productService.js'
import { addToCart } from '../services/cartService.js'

// Création de la carte de produit
const createProductCard = (product, onAdd) => {
  const card = document.createElement('article')
  card.className = 'rounded-lg border border-slate-700 bg-slate-800 p-4'

  const title = document.createElement('h3')
  title.className = 'text-lg font-semibold'
  title.textContent = product.label ?? 'Produit'

  const category = document.createElement('p')
  category.className = 'mt-1 text-xs text-slate-300'
  category.textContent = `Categorie: ${product.category ?? 'N/A'}`

  const description = document.createElement('p')
  description.className = 'mt-3 text-sm text-slate-200'
  description.textContent = product.description ?? ''

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
  detailLink.textContent = 'Voir detail'

  const actions = document.createElement('div')
  actions.className = 'flex items-center gap-3'
  actions.append(detailLink, button)

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

  toolbar.append(input)

  const grid = document.createElement('div')
  grid.className = 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'

  let products = []

  // Fonction pour afficher la liste des produits
  const renderList = (query = '') => {
    const filtered = searchProducts(products, query)
    grid.innerHTML = ''

    if (filtered.length === 0) {
      const empty = document.createElement('p')
      empty.className = 'text-sm text-slate-300'
      empty.textContent = 'Aucun produit trouve.'
      grid.append(empty)
      return
    }

    filtered.forEach((product) => {
      const card = createProductCard(product, (selectedProduct) => {
        addToCart(selectedProduct)
        feedback.textContent = `${selectedProduct.label} ajoute au panier.`
      })
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
      error.textContent = 'Impossible de charger les produits.'
      grid.innerHTML = ''
      grid.append(error)
    })

  page.append(heading, toolbar, feedback, grid)
  return page
}

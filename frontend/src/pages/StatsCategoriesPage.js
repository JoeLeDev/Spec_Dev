import { getCategoryStats } from '../services/productService.js'
import {
  createMobileCardList,
  createStatsMobileCard,
  createTableWrapper,
} from '../utils/responsiveLayout.js'
import { clearElement, setSafeText } from '../utils/dom.js'

// Création de l'en-tête du tableau de statistiques catégories.
const createStatsTableHead = () => {
  const thead = document.createElement('thead')
  thead.className = 'bg-slate-700'
  thead.innerHTML = `
    <tr>
      <th class="px-3 py-2 text-left text-sm">Catégorie</th>
      <th class="px-3 py-2 text-left text-sm">Nombre de produits</th>
    </tr>
  `
  return thead
}

// Crée une ligne de tableau à partir d'une statistique (desktop).
const createStatsRow = (item) => {
  const row = document.createElement('tr')
  row.className = 'border-t border-slate-700'

  const categoryCell = document.createElement('td')
  categoryCell.className = 'px-3 py-2 text-sm'
  setSafeText(categoryCell, item.nom ?? 'N/A')

  const countCell = document.createElement('td')
  countCell.className = 'px-3 py-2 text-sm'
  setSafeText(countCell, String(Number(item.compte ?? 0)))

  row.append(categoryCell, countCell)
  return row
}

// Construit la page publique de stats catégories avec états chargement/erreur.
export const createStatsCategoriesPage = () => {
  const page = document.createElement('section')
  page.className = 'page-section space-y-4'

  const heading = document.createElement('h1')
  heading.className = 'text-2xl font-bold sm:text-3xl'
  heading.textContent = 'Stats catégories'

  const loading = document.createElement('p')
  loading.className = 'text-sm text-slate-300'
  loading.textContent = 'Chargement des statistiques...'

  const error = document.createElement('p')
  error.className = 'text-sm text-red-400'
  error.setAttribute('role', 'alert')

  const mobileList = createMobileCardList()
  const table = document.createElement('table')
  table.append(createStatsTableHead())

  const tbody = document.createElement('tbody')
  table.append(tbody)
  const desktopTable = createTableWrapper(table)

  getCategoryStats()
    .then((items) => {
      loading.remove()
      clearElement(tbody)
      clearElement(mobileList)

      if (!items.length) {
        const message = 'Aucune statistique disponible.'

        const mobileEmpty = document.createElement('p')
        mobileEmpty.className =
          'rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-slate-300 md:hidden'
        setSafeText(mobileEmpty, message)
        mobileList.append(mobileEmpty)

        const emptyRow = document.createElement('tr')
        const emptyCell = document.createElement('td')
        emptyCell.colSpan = 2
        emptyCell.className = 'px-3 py-3 text-sm text-slate-300'
        setSafeText(emptyCell, message)
        emptyRow.append(emptyCell)
        tbody.append(emptyRow)
        return
      }

      items.forEach((item) => {
        mobileList.append(createStatsMobileCard(item))
        tbody.append(createStatsRow(item))
      })
    })
    .catch((err) => {
      loading.remove()
      error.textContent = err.message || 'Impossible de charger les statistiques.'
    })

  page.append(heading, loading, error, mobileList, desktopTable)
  return page
}

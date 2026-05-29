import { getCategoryStats } from '../services/productService.js'
import { clearElement, setSafeText } from '../utils/dom.js'

// Création de l'entête du tableau de statistiques categories.
const createStatsTableHead = () => {
  const thead = document.createElement('thead')
  thead.className = 'bg-slate-700'
  thead.innerHTML = `
    <tr>
      <th class="px-4 py-2 text-left text-sm">Categorie</th>
      <th class="px-4 py-2 text-left text-sm">Nombre de produits</th>
    </tr>
  `
  return thead
}

// Cree une ligne de tableau a partir d une statistique.
const createStatsRow = (item) => {
  const row = document.createElement('tr')
  row.className = 'border-t border-slate-700'

  const categoryCell = document.createElement('td')
  categoryCell.className = 'px-4 py-2 text-sm'
  setSafeText(categoryCell, item.nom ?? 'N/A')

  const countCell = document.createElement('td')
  countCell.className = 'px-4 py-2 text-sm'
  setSafeText(countCell, String(Number(item.compte ?? 0)))

  row.append(categoryCell, countCell)
  return row
}

// Construit la page publique de stats categories avec etats chargement/erreur.
export const createStatsCategoriesPage = () => {
  const page = document.createElement('section')
  page.className = 'space-y-4'

  const heading = document.createElement('h1')
  heading.className = 'text-3xl font-bold'
  heading.textContent = 'Stats categories'

  const loading = document.createElement('p')
  loading.className = 'text-sm text-slate-300'
  loading.textContent = 'Chargement des statistiques...'

  const error = document.createElement('p')
  error.className = 'text-sm text-red-400'
  error.setAttribute('role', 'alert')

  const wrapper = document.createElement('div')
  wrapper.className = 'overflow-x-auto rounded-lg border border-slate-700 bg-slate-800'

  const table = document.createElement('table')
  table.className = 'min-w-full'
  table.append(createStatsTableHead())

  const tbody = document.createElement('tbody')
  table.append(tbody)
  wrapper.append(table)

  getCategoryStats()
    .then((items) => {
      loading.remove()
      clearElement(tbody)

      if (!items.length) {
        const emptyRow = document.createElement('tr')
        const emptyCell = document.createElement('td')
        emptyCell.colSpan = 2
        emptyCell.className = 'px-4 py-3 text-sm text-slate-300'
        setSafeText(emptyCell, 'Aucune statistique disponible.')
        emptyRow.append(emptyCell)
        tbody.append(emptyRow)
        return
      }

      items.forEach((item) => {
        tbody.append(createStatsRow(item))
      })
    })
    .catch((err) => {
      loading.remove()
      error.textContent = err.message || 'Impossible de charger les statistiques.'
    })

  page.append(heading, loading, error, wrapper)
  return page
}

import { getCspReports } from '../services/cspService.js'
import { clearElement, setSafeText } from '../utils/dom.js'

// Crée une ligne de tableau pour un rapport CSP.
const createReportRow = (report) => {
  const row = document.createElement('tr')
  row.className = 'border-t border-slate-700'

  const cells = [
    report.date ?? 'N/A',
    report.directive ?? 'N/A',
    report.blockedUri ?? 'N/A',
    report.documentUri ?? 'N/A',
  ]

  cells.forEach((value) => {
    const cell = document.createElement('td')
    cell.className = 'px-4 py-2 text-sm'
    setSafeText(cell, value)
    row.append(cell)
  })

  return row
}

// Construit la page des rapports CSP.
export const createCspReportPage = () => {
  const page = document.createElement('section')
  page.className = 'space-y-4'

  const heading = document.createElement('h1')
  heading.className = 'text-3xl font-bold'
  heading.textContent = 'Rapports CSP'

  const info = document.createElement('p')
  info.className = 'text-sm text-slate-300'
  info.textContent =
    "Dernières violations CSP enregistrées par le backend (GET /csp-reports). La liste peut être vide tant qu'aucune violation n'a été signalée."

  const loading = document.createElement('p')
  loading.className = 'text-sm text-slate-300'
  loading.textContent = 'Chargement des rapports...'

  const error = document.createElement('p')
  error.className = 'text-sm text-red-400'
  error.setAttribute('role', 'alert')

  const wrapper = document.createElement('div')
  wrapper.className = 'overflow-x-auto rounded-lg border border-slate-700 bg-slate-800'

  const table = document.createElement('table')
  table.className = 'min-w-full'

  const thead = document.createElement('thead')
  thead.className = 'bg-slate-700'
  thead.innerHTML = `
    <tr>
      <th class="px-4 py-2 text-left text-sm">Date</th>
      <th class="px-4 py-2 text-left text-sm">Directive</th>
      <th class="px-4 py-2 text-left text-sm">URI bloquée</th>
      <th class="px-4 py-2 text-left text-sm">Page</th>
    </tr>
  `

  const tbody = document.createElement('tbody')
  table.append(thead, tbody)
  wrapper.append(table)

  getCspReports()
    .then((reports) => {
      loading.remove()
      clearElement(tbody)

      if (!reports.length) {
        const row = document.createElement('tr')
        const cell = document.createElement('td')
        cell.colSpan = 4
        cell.className = 'px-4 py-3 text-sm text-slate-300'
        setSafeText(cell, 'Aucun rapport CSP disponible.')
        row.append(cell)
        tbody.append(row)
        return
      }

      reports.forEach((report) => tbody.append(createReportRow(report)))
    })
    .catch((err) => {
      loading.remove()
      setSafeText(error, err.message || 'Impossible de charger les rapports CSP.')
    })

  page.append(heading, info, loading, error, wrapper)
  return page
}

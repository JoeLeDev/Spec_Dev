import { setSafeText } from './dom.js'

// Enveloppe un tableau pour le desktop (scroll interne si besoin).
export const createTableWrapper = (table) => {
  const wrapper = document.createElement('div')
  wrapper.className =
    'hidden w-full max-w-full overflow-x-auto rounded-lg border border-slate-700 bg-slate-800 md:block'
  table.className = 'w-full text-left text-sm'
  wrapper.append(table)
  return wrapper
}

// Carte mobile pour une stat catégorie.
export const createStatsMobileCard = (item) => {
  const card = document.createElement('article')
  card.className = 'rounded-lg border border-slate-700 bg-slate-900 p-3'

  const row = document.createElement('div')
  row.className = 'flex items-center justify-between gap-3'

  const label = document.createElement('p')
  label.className = 'text-sm text-slate-300'
  setSafeText(label, item.nom ?? 'N/A')

  const value = document.createElement('p')
  value.className = 'text-lg font-semibold text-indigo-300'
  setSafeText(value, String(Number(item.compte ?? 0)))

  row.append(label, value)
  card.append(row)
  return card
}

// Carte mobile pour un rapport CSP.
export const createCspReportMobileCard = (report) => {
  const card = document.createElement('article')
  card.className = 'space-y-2 rounded-lg border border-slate-700 bg-slate-900 p-3'

  const fields = [
    ['Date', report.date ?? 'N/A'],
    ['Directive', report.directive ?? 'N/A'],
    ['URI bloquée', report.blockedUri ?? 'N/A'],
    ['Page', report.documentUri ?? 'N/A'],
  ]

  fields.forEach(([label, value]) => {
    const block = document.createElement('div')
    block.className = 'min-w-0'

    const title = document.createElement('p')
    title.className = 'text-xs uppercase tracking-wide text-slate-400'
    setSafeText(title, label)

    const content = document.createElement('p')
    content.className = 'break-all text-sm text-slate-200'
    setSafeText(content, value)

    block.append(title, content)
    card.append(block)
  })

  return card
}

// Liste mobile (cartes empilées).
export const createMobileCardList = () => {
  const list = document.createElement('div')
  list.className = 'flex w-full min-w-0 flex-col gap-3 md:hidden'
  return list
}

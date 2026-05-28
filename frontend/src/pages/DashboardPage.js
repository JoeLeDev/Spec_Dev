// Construit une page dashboard simple reservee aux utilisateurs connectes.
export const createDashboardPage = () => {
  const page = document.createElement('section')
  page.className = 'space-y-3'

  const heading = document.createElement('h1')
  heading.className = 'text-3xl font-bold'
  heading.textContent = 'Dashboard'

  const subtitle = document.createElement('p')
  subtitle.className = 'text-slate-300'
  subtitle.textContent =
    'Espace connecte. Tu pourras y afficher un recap utilisateur et des actions privees.'

  const todo = document.createElement('ul')
  todo.className = 'list-disc space-y-1 pl-5 text-sm text-slate-200'
  todo.innerHTML = `
    <li>Ajouter un resume du compte connecte</li>
    <li>Ajouter des raccourcis vers le CRUD produit</li>
    <li>Garder cette page protegee par auth guard</li>
  `

  page.append(heading, subtitle, todo)
  return page
}

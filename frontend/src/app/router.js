const routes = []

// Pour normaliser le path afin d'éviter les erreurs de chemin
const normalizePath = (path) => (path.startsWith('/') ? path : `/${path}`)

// Pour enregistrer une route
export const registerRoute = (path, render) => {
  routes.push({ path: normalizePath(path), render })
}

// Pour convertir le path en expression régulière
const pathToRegex = (path) =>
  new RegExp(`^${path.replace(/:[^/]+/g, '([^/]+)')}$`)

// Pour extraire les noms des paramètres
const extractParamNames = (path) =>
  [...path.matchAll(/:([^/]+)/g)].map((match) => match[1])

// Pour matcher la route avec le pathname
const matchRoute = (pathname) => {
  for (const route of routes) {
    const regex = pathToRegex(route.path)
    const matched = pathname.match(regex)
    if (!matched) continue

    const paramNames = extractParamNames(route.path)
    const params = paramNames.reduce((acc, name, index) => {
      acc[name] = decodeURIComponent(matched[index + 1] ?? '')
      return acc
    }, {})

    return { render: route.render, params }
  }

  return null
}

const renderNotFound = (app, pathname) => {
  const notFound = routes.find((route) => route.path === '/404')
  if (!notFound) {
    app.textContent = 'Page non trouvée'
    return
  }

  app.innerHTML = ''
  app.append(notFound.render({ params: {}, pathname }))
}

// Pour naviguer vers une route
export const navigateTo = (path) => {
  const safePath = normalizePath(path)
  window.history.pushState({}, '', safePath)
  renderCurrentRoute()
}

// Pour rendre la route courante
export const renderCurrentRoute = () => {
  const app = document.querySelector('#app')
  if (!app) return

  const pathname = window.location.pathname
  const routeMatch = matchRoute(pathname)

  if (!routeMatch) {
    renderNotFound(app, pathname)
    return
  }

  app.innerHTML = ''
  app.append(routeMatch.render({ params: routeMatch.params, pathname }))
}

// Pour initialiser le router
export const initRouter = () => {
  window.addEventListener('popstate', renderCurrentRoute)

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-link]')
    if (!link) return

    event.preventDefault()
    const href = link.getAttribute('href')
    if (!href) return
    navigateTo(href)
  })

  renderCurrentRoute()
}

const routes = new Map()

const normalizePath = (path) => (path.startsWith('/') ? path : `/${path}`)

export const registerRoute = (path, render) => {
  routes.set(normalizePath(path), render)
}

const matchRoute = (pathname) => routes.get(pathname) ?? routes.get('/404')

export const navigateTo = (path) => {
  const safePath = normalizePath(path)
  window.history.pushState({}, '', safePath)
  renderCurrentRoute()
}

export const renderCurrentRoute = () => {
  const app = document.querySelector('#app')
  if (!app) return

  const pathname = window.location.pathname
  const render = matchRoute(pathname)

  if (!render) {
    app.textContent = 'Page non trouvée'
    return
  }

  app.innerHTML = ''
  app.append(render())
}

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
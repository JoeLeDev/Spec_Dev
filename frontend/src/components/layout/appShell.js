import { createNavbar, bindNavbarActions } from './Navbar.js'
import { createFooter } from './Footer.js'
import { setSafeText } from '../../utils/dom.js'

// Crée le shell commun : navbar, zone de contenu, footer.
export const createAppShell = (renderContent, { pathname = window.location.pathname } = {}) => {
  const el = document.createElement('main')
  el.className =
    'flex min-h-screen w-full min-w-0 max-w-[100vw] flex-col overflow-x-hidden bg-slate-900 p-4 text-white sm:p-6 md:p-8'

  const navbar = createNavbar(pathname)
  bindNavbarActions(navbar)
  el.append(navbar)

  const contentSlot = document.createElement('div')
  contentSlot.className = 'page-section flex-1 space-y-4'
  contentSlot.setAttribute('data-layout-content', 'true')

  const content = renderContent()
  if (content) contentSlot.append(content)

  el.append(contentSlot, createFooter())
  return el
}

// Variante avec titre H1 au-dessus du contenu.
export const createAppShellWithTitle = (title, renderContent, options = {}) => {
  return createAppShell(() => {
    const wrapper = document.createElement('div')
    wrapper.className = 'page-section space-y-4'

    if (title) {
      const heading = document.createElement('h1')
      heading.className = 'text-2xl font-bold sm:text-3xl'
      setSafeText(heading, title)
      wrapper.append(heading)
    }

    const content = renderContent()
    if (content) wrapper.append(content)
    return wrapper
  }, options)
}

import { setSafeText } from '../../utils/dom.js'

// Crée le pied de page commun (copyright + liens utiles).
export const createFooter = () => {
  const footer = document.createElement('footer')
  footer.className =
    'mt-6 w-full min-w-0 max-w-full border-t border-slate-700 pt-4 text-xs text-slate-400 sm:mt-8'

  const row = document.createElement('div')
  row.className = 'flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3'

  const copyright = document.createElement('p')
  setSafeText(copyright, `© ${new Date().getFullYear()} Spec_Dev — Jonathan & Ewa`)

  const links = document.createElement('div')
  links.className = 'flex flex-wrap gap-4'

  const securityLink = document.createElement('a')
  securityLink.href = '/.well-known/security.txt'
  securityLink.target = '_blank'
  securityLink.rel = 'noopener noreferrer'
  securityLink.className = 'text-indigo-300 hover:underline'
  securityLink.textContent = 'security.txt'

  links.append(securityLink)
  row.append(copyright, links)
  footer.append(row)

  return footer
}

import { login } from '../services/authService.js'
import { ROUTES } from '../utils/constants.js'
import { navigateTo } from '../app/router.js'
import { validateAuthForm } from '../utils/validators.js'
import { createAppShell } from '../components/layout/appShell.js'

// Formulaire de connexion (contenu seul).
const createLoginForm = () => {
  const section = document.createElement('section')
  section.className = 'mx-auto w-full max-w-md rounded-lg bg-slate-800 p-4 shadow sm:p-6'

  section.innerHTML = `
    <h1 class="mb-6 text-2xl font-bold">Connexion</h1>
    <form id="login-form" class="space-y-4" novalidate>
      <div>
        <label for="email" class="mb-1 block text-sm">Email</label>
        <input id="email" name="email" type="email" class="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2" required />
      </div>
      <div>
        <label for="password" class="mb-1 block text-sm">Mot de passe</label>
        <input id="password" name="password" type="password" class="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2" required />
      </div>
      <p id="login-error" class="text-sm text-red-400" role="alert"></p>
      <button type="submit" class="w-full rounded bg-indigo-500 px-4 py-2 font-semibold hover:bg-indigo-400">
        Se connecter
      </button>
    </form>
    <p class="mt-4 text-sm text-slate-300">
      Pas de compte ?
      <a data-link href="${ROUTES.REGISTER}" class="text-indigo-300 hover:underline">Inscription</a>
    </p>
  `

  const form = section.querySelector('#login-form')
  const errorBox = section.querySelector('#login-error')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    errorBox.textContent = ''

    const formData = new FormData(form)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '').trim()

    const validationError = validateAuthForm({ email, password })
    if (validationError) {
      errorBox.textContent = validationError
      return
    }

    try {
      await login({ email, password })
      navigateTo(ROUTES.PRODUCTS)
    } catch (error) {
      errorBox.textContent = error.message || 'Impossible de se connecter.'
    }
  })

  return section
}

export const createLoginPage = (routeContext = {}) =>
  createAppShell(() => createLoginForm(), { pathname: routeContext.pathname })

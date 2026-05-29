import { register } from '../services/authService.js'
import { ROUTES } from '../utils/constants.js'
import { navigateTo } from '../app/router.js'
import { validateAuthForm } from '../utils/validators.js'
import { createAppShell } from '../components/layout/appShell.js'

// Formulaire d'inscription (contenu seul).
const createRegisterForm = () => {
  const section = document.createElement('section')
  section.className = 'mx-auto w-full max-w-md rounded-lg bg-slate-800 p-4 shadow sm:p-6'

  section.innerHTML = `
    <h1 class="mb-6 text-2xl font-bold">Inscription</h1>
    <form id="register-form" class="space-y-4" novalidate>
      <div>
        <label for="email" class="mb-1 block text-sm">Email</label>
        <input id="email" name="email" type="email" class="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2" required />
      </div>
      <div>
        <label for="password" class="mb-1 block text-sm">Mot de passe</label>
        <input id="password" name="password" type="password" class="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2" required />
      </div>
      <p id="register-error" class="text-sm text-red-400" role="alert"></p>
      <button type="submit" class="w-full rounded bg-emerald-500 px-4 py-2 font-semibold hover:bg-emerald-400">
        Créer un compte
      </button>
    </form>
    <p class="mt-4 text-sm text-slate-300">
      Déjà inscrit ?
      <a data-link href="${ROUTES.LOGIN}" class="text-indigo-300 hover:underline">Connexion</a>
    </p>
  `

  const form = section.querySelector('#register-form')
  const errorBox = section.querySelector('#register-error')

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
      await register({ email, password })
      navigateTo(ROUTES.LOGIN)
    } catch (error) {
      errorBox.textContent = error.message || 'Impossible de créer le compte.'
    }
  })

  return section
}

export const createRegisterPage = (routeContext = {}) =>
  createAppShell(() => createRegisterForm(), { pathname: routeContext.pathname })

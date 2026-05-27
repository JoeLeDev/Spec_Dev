import { register } from '../services/authService.js'
import { ROUTES } from '../utils/constants.js'
import { navigateTo } from '../app/router.js'

export const createRegisterPage = () => {
  const page = document.createElement('main')
  page.className = 'min-h-screen bg-slate-900 text-white p-6'

  page.innerHTML = `
    <section class="mx-auto mt-10 max-w-md rounded-lg bg-slate-800 p-6 shadow">
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
    </section>
  `

  const form = page.querySelector('#register-form')
  const errorBox = page.querySelector('#register-error')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    errorBox.textContent = ''

    const formData = new FormData(form)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '').trim()

    if (!email || !password) {
      errorBox.textContent = 'Tous les champs sont obligatoires.'
      return
    }

    try {
      await register({ email, password })
      navigateTo(ROUTES.LOGIN)
    } catch (error) {
      errorBox.textContent = error.message || 'Impossible de créer le compte.'
    }
  })

  return page
}

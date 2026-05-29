import { STORAGE_KEYS } from '../utils/constants.js'
import { navigateTo } from '../app/router.js'
import { ROUTES } from '../utils/constants.js'
import {
  createProduct,
  getProductById,
  updateProduct,
} from '../services/productService.js'
import { validateImageFile, validateProductForm } from '../utils/validators.js'

// Construit le formulaire CRUD produit (creation ou edition).
export const createProductFormPage = ({ params }) => {
  const productId = params?.id
  const isEditMode = Boolean(productId)

  const page = document.createElement('section')
  page.className = 'space-y-4'

  const heading = document.createElement('h1')
  heading.className = 'text-3xl font-bold'
  heading.textContent = isEditMode ? 'Modifier un produit' : 'Nouveau produit'

  const form = document.createElement('form')
  form.className = 'mx-auto max-w-xl space-y-4 rounded-lg border border-slate-700 bg-slate-800 p-6'
  form.setAttribute('novalidate', 'true')

  form.innerHTML = `
    <div>
      <label for="label" class="mb-1 block text-sm">Libelle</label>
      <input id="label" name="label" class="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2" required />
    </div>
    <div>
      <label for="description" class="mb-1 block text-sm">Description</label>
      <textarea id="description" name="description" rows="4" class="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2" required></textarea>
    </div>
    <div>
      <label for="price" class="mb-1 block text-sm">Prix (EUR)</label>
      <input id="price" name="price" type="number" min="0" step="0.01" class="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2" required />
    </div>
    <div>
      <label for="category" class="mb-1 block text-sm">Categorie</label>
      <input id="category" name="category" class="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2" required />
    </div>
    <div>
      <label for="image" class="mb-1 block text-sm">Image</label>
      <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="w-full text-sm" />
      <img id="image-preview" alt="Apercu image" class="mt-2 hidden max-h-40 rounded border border-slate-600" />
    </div>
    <p id="form-error" class="text-sm text-red-400" role="alert"></p>
    <button type="submit" class="w-full rounded bg-indigo-500 px-4 py-2 font-semibold hover:bg-indigo-400">
      ${isEditMode ? 'Enregistrer' : 'Creer le produit'}
    </button>
  `

  const csrfInput = document.createElement('input')
  csrfInput.type = 'hidden'
  csrfInput.name = '_csrf'
  csrfInput.value = localStorage.getItem(STORAGE_KEYS.CSRF_TOKEN) ?? ''
  form.prepend(csrfInput)

  const errorBox = form.querySelector('#form-error')
  const imageInput = form.querySelector('#image')
  const imagePreview = form.querySelector('#image-preview')

  // Affiche un apercu local de l image selectionnee.
  imageInput.addEventListener('change', () => {
    const file = imageInput.files?.[0]
    const imageError = validateImageFile(file)
    if (imageError) {
      errorBox.textContent = imageError
      imagePreview.classList.add('hidden')
      return
    }

    errorBox.textContent = ''
    if (!file) {
      imagePreview.classList.add('hidden')
      return
    }

    imagePreview.src = URL.createObjectURL(file)
    imagePreview.classList.remove('hidden')
  })

  // Pre-remplit le formulaire en mode edition.
  if (isEditMode) {
    getProductById(productId).then((product) => {
      if (!product) {
        errorBox.textContent = 'Produit introuvable.'
        return
      }

      form.label.value = product.label ?? ''
      form.description.value = product.description ?? ''
      form.price.value = String(product.price ?? '')
      form.category.value = product.category ?? ''
    })
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    errorBox.textContent = ''

    const formData = new FormData(form)
    const payload = {
      label: String(formData.get('label') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim(),
      price: Number(formData.get('price')),
      category: String(formData.get('category') ?? '').trim(),
      _csrf: String(formData.get('_csrf') ?? ''),
    }

    const validationError = validateProductForm(payload)
    if (validationError) {
      errorBox.textContent = validationError
      return
    }

    const imageFile = imageInput.files?.[0]
    const imageError = validateImageFile(imageFile)
    if (imageError) {
      errorBox.textContent = imageError
      return
    }

    if (imageFile) {
      payload.imageName = imageFile.name
    }

    try {
      if (isEditMode) {
        await updateProduct(productId, payload)
      } else {
        await createProduct(payload)
      }
      navigateTo(ROUTES.PRODUCTS)
    } catch (error) {
      errorBox.textContent = error.message || 'Impossible d enregistrer le produit.'
    }
  })

  page.append(heading, form)
  return page
}

import { navigateTo } from '../app/router.js'
import { ROUTES } from '../utils/constants.js'
import { fetchCsrfToken, getStoredCsrfToken } from '../services/csrfService.js'
import { appendProductGallery } from '../utils/productImages.js'
import {
  createProduct,
  getProductById,
  updateProduct,
} from '../services/productService.js'
import {
  MAX_PRODUCT_IMAGES,
  validateImageFiles,
  validateProductForm,
} from '../utils/validators.js'

// Affiche les aperçus locaux des fichiers sélectionnés.
const renderSelectedPreviews = (container, files, previewUrls) => {
  container.replaceChildren()
  previewUrls.forEach((url) => URL.revokeObjectURL(url))
  previewUrls.length = 0

  if (!files.length) {
    container.classList.add('hidden')
    return
  }

  container.classList.remove('hidden')
  const grid = document.createElement('div')
  grid.className = 'mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3'

  files.forEach((file) => {
    const url = URL.createObjectURL(file)
    previewUrls.push(url)

    const img = document.createElement('img')
    img.src = url
    img.alt = file.name
    img.className = 'h-28 w-full rounded border border-slate-600 object-cover'
    grid.append(img)
  })

  container.append(grid)
}

// Construit le formulaire CRUD produit (création ou édition).
export const createProductFormPage = ({ params }) => {
  const productId = params?.id
  const isEditMode = Boolean(productId)
  const previewUrls = []
  let existingImageCount = 0

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
      <label for="label" class="mb-1 block text-sm">Libellé</label>
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
      <label for="category" class="mb-1 block text-sm">Catégorie</label>
      <input id="category" name="category" class="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2" required />
    </div>
    <div id="existing-images" class="hidden space-y-2">
      <p class="text-sm text-slate-300">Images actuelles</p>
      <div id="existing-images-gallery"></div>
    </div>
    <div>
      <label for="images" class="mb-1 block text-sm">Images (jusqu'à ${MAX_PRODUCT_IMAGES}, jpeg/png/webp/gif, 2 Mo max)</label>
      <input
        id="images"
        name="images"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        class="w-full text-sm"
      />
      <div id="image-previews" class="hidden"></div>
    </div>
    <p id="form-error" class="text-sm text-red-400" role="alert"></p>
    <button type="submit" class="w-full rounded bg-indigo-500 px-4 py-2 font-semibold hover:bg-indigo-400">
      ${isEditMode ? 'Enregistrer' : 'Créer le produit'}
    </button>
  `

  const csrfInput = document.createElement('input')
  csrfInput.type = 'hidden'
  csrfInput.name = '_csrf'
  csrfInput.value = getStoredCsrfToken()
  form.prepend(csrfInput)

  const errorBox = form.querySelector('#form-error')
  const imageInput = form.querySelector('#images')
  const previewContainer = form.querySelector('#image-previews')
  const existingImagesBlock = form.querySelector('#existing-images')
  const existingImagesGallery = form.querySelector('#existing-images-gallery')

  fetchCsrfToken()
    .then((token) => {
      csrfInput.value = token
    })
    .catch(() => {
      errorBox.textContent = "Impossible de récupérer le token CSRF. Réconnecte-toi."
    })

  imageInput.addEventListener('change', () => {
    const files = Array.from(imageInput.files ?? [])
    const imageError = validateImageFiles(files, { existingCount: existingImageCount })
    if (imageError) {
      errorBox.textContent = imageError
      renderSelectedPreviews(previewContainer, [], previewUrls)
      return
    }

    errorBox.textContent = ''
    renderSelectedPreviews(previewContainer, files, previewUrls)
  })

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

      existingImageCount = product.images?.length ?? 0
      if (existingImageCount > 0) {
        existingImagesBlock.classList.remove('hidden')
        appendProductGallery(existingImagesGallery, product)
      }
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

    const imageFiles = Array.from(imageInput.files ?? [])
    const imageError = validateImageFiles(imageFiles, { existingCount: existingImageCount })
    if (imageError) {
      errorBox.textContent = imageError
      return
    }

    if (imageFiles.length) {
      payload.imageFiles = imageFiles
    }

    try {
      if (isEditMode) {
        await updateProduct(productId, payload)
      } else {
        await createProduct(payload)
      }
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
      navigateTo(ROUTES.PRODUCTS)
    } catch (error) {
      errorBox.textContent = error.message || "Impossible d'enregistrer le produit."
    }
  })

  page.append(heading, form)
  return page
}

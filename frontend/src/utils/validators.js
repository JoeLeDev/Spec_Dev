const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateEmail = (email) => {
  if (!email) return "L'email est obligatoire."
  if (!EMAIL_REGEX.test(email)) return "Format d'email invalide."
  return ""
}

export const validatePassword = (password) => {
  if (!password) return "Le mot de passe est obligatoire."
  if (password.length < 8) return "Le mot de passe doit faire au moins 8 caracteres."
  return ""
}

export const validateAuthForm = ({ email, password }) => {
  const emailError = validateEmail(email)
  if (emailError) return emailError
  const passwordError = validatePassword(password)
  if (passwordError) return passwordError
  return ""
}

// Valide les champs obligatoires d'un produit.
export const validateProductForm = ({ label, description, price, category }) => {
  if (!label?.trim()) return 'Le libelle est obligatoire.'
  if (!description?.trim()) return 'La description est obligatoire.'
  if (!category?.trim()) return 'La categorie est obligatoire.'
  if (Number.isNaN(Number(price)) || Number(price) < 0) {
    return 'Le prix doit etre un nombre positif.'
  }
  return ''
}

// Valide un fichier image cote UI (type et taille).
export const validateImageFile = (file) => {
  if (!file) return ''

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return 'Format image non autorise (jpeg, png, webp, gif).'
  }

  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) return 'Image trop volumineuse (max 2 Mo).'

  return ''
}

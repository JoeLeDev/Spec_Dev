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

import { sanitizeText } from './sanitizer.js'

// Vide un élément DOM sans utiliser innerHTML.
export const clearElement = (element) => {
  element.replaceChildren()
}

// Définit un texte affiché de manière sûre.
export const setSafeText = (element, value) => {
  element.textContent = sanitizeText(value)
}

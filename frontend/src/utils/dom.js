import { sanitizeText } from './sanitizer.js'

// Vide un element DOM sans utiliser innerHTML.
export const clearElement = (element) => {
  element.replaceChildren()
}

// Definit un texte affiche de maniere sure.
export const setSafeText = (element, value) => {
  element.textContent = sanitizeText(value)
}

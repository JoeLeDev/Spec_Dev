// Nettoie une valeur texte avant affichage utilisateur.
export const sanitizeText = (value) => String(value ?? '').trim()

// Échappe une chaîne pour insertion HTML.
export const escapeHtml = (value) => {
  const node = document.createElement('span')
  node.textContent = sanitizeText(value)
  return node.innerHTML
}

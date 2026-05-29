// Nettoie une valeur texte avant affichage utilisateur.
export const sanitizeText = (value) => String(value ?? '').trim()

// Echappe une chaine pour insertion HTML.
export const escapeHtml = (value) => {
  const node = document.createElement('span')
  node.textContent = sanitizeText(value)
  return node.innerHTML
}

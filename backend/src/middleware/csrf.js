import crypto from 'node:crypto'

// Génère et conserve un token CSRF en session.
export const csrfToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomUUID()
  }
  next()
}

// Vérifie l'en-tête x-csrf-token pour les requêtes sensibles.
export const verifyCsrfToken = (req, res, next) => {
  if (req.headers['x-csrf-token'] !== req.session.csrfToken) {
    return res.status(403).json({ erreur: 'Token CSRF invalide' })
  }
  next()
}

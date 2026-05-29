# Spec_Dev

Projet de specialisation — Groupe 2 Jonathan & Ewa.

Application e-commerce en architecture separee :

- **Frontend** : JavaScript vanilla (Vite + Tailwind), `http://localhost:5173`
- **Backend** : Node.js / Express / Prisma / SQLite, `http://localhost:3000`

## Prerequis

- Node.js 20+
- npm

## Installation

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
```

Configurer au minimum dans `.env` :

- `PORT=3000` (ou le port utilise par votre API)
- `SESSION_SECRET=une-valeur-secrete-unique`
- `DATABASE_URL="file:./dev.db"`

Puis :

```bash
npx prisma migrate dev
npm run dev
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Ouvrir : `http://localhost:5173`

Verifier que `frontend/src/utils/constants.js` pointe vers la bonne URL API :

```js
export const API_BASE_URL = 'http://localhost:3000'
```

## Fonctionnalites frontend

- Auth : inscription, connexion, deconnexion (session cookie)
- Produits : liste, recherche, detail, images
- Panier local (localStorage)
- Stats categories (`/stats/categories`)
- CRUD produit (UI) — necessite les routes POST/PUT/DELETE cote backend
- Page rapports CSP (connectee)
- Fichier `/.well-known/security.txt`

## Tests manuels rapides

1. Inscription + connexion
2. Liste produits + recherche + detail + images
3. Ajout au panier + modification quantites
4. Stats categories
5. Creation / edition / suppression produit (si API CRUD disponible)
6. Page CSP (connecte)
7. `http://localhost:5173/.well-known/security.txt`

## Structure frontend

```txt
frontend/src/
  app/          # router, store, guards
  pages/        # ecrans
  services/     # appels API
  components/   # UI reutilisable (Navbar)
  utils/        # validators, sanitizer, dom, images
```

## Securite (front)

- Affichage des donnees API via `textContent` / `setSafeText`
- Validation formulaires (`validators.js`)
- Token CSRF dans le formulaire produit (champ cache)
- `security.txt` expose en statique

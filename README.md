# Spec_Dev

Projet de spécialisation — Groupe 2 Jonathan & Ewa.

Application e-commerce en architecture séparée :

- **Frontend** : JavaScript vanilla (Vite + Tailwind), `http://localhost:5173`
- **Backend** : Node.js / Express / Prisma / SQLite, `http://localhost:3000`

## Prérequis

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

- `PORT=3000` (ou le port utilisé par votre API)
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

Vérifier que `frontend/src/utils/constants.js` pointe vers la bonne URL API :

```js
export const API_BASE_URL = 'http://localhost:3000'
```

## Fonctionnalités frontend

- Auth : inscription, connexion, déconnexion (session cookie)
- Produits : liste, recherche, détail, images
- Panier local (localStorage)
- Stats catégories (`/stats/categories`)
- CRUD produit (UI + API)
- Page rapports CSP (connectée)
- Dashboard résumé (utilisateur, nb produits, nb rapports CSP)
- Fichier `/.well-known/security.txt`

## Bonus implémentés

### 1) CSP réelle + report-uri / report-to

- **Frontend (Vite)** : en-têtes `Content-Security-Policy-Report-Only` et `Reporting-Endpoints` sur le dev server (`frontend/vite.config.js`, config partagée dans `frontend/src/config/csp.js`).
- **Backend** : en-tête `Content-Security-Policy` sur les réponses API (`backend/src/middleware/cspHeaders.js`).
- Les violations sont envoyées vers `POST http://localhost:3000/csp-reports` puis visibles sur la page **CSP** (`GET /csp-reports`, session requise).

En dev, Vite génère naturellement des rapports (scripts inline / HMR) : le compteur CSP du dashboard augmente après navigation.

Variable optionnelle backend : `CSP_REPORT_URI` (défaut : `http://localhost:3000/csp-reports`).

### 2) Tests Jest (frontend uniquement)

```bash
cd frontend
npm test
```

Couverture actuelle :

- `src/services/__tests__/productService.test.js` — mapping API, recherche locale
- `src/services/__tests__/authService.test.js` — session, login + CSRF (mocks)

### 3) Dashboard résumé

Page `/dashboard` (protégée) affiche :

- email de l'utilisateur connecté
- nombre de produits (API)
- nombre de rapports CSP (API)
- raccourcis vers produits, CRUD, stats, CSP

## Tests manuels rapides

1. Inscription + connexion
2. Liste produits + recherche + détail + images
3. Ajout au panier + modification quantités
4. Stats catégories
5. Création / édition / suppression produit
6. Dashboard : vérifier les 3 compteurs
7. Page CSP (connecté) — attendre quelques secondes après navigation pour voir les rapports Report-Only
8. `http://localhost:5173/.well-known/security.txt`

## Tests automatisés

```bash
cd frontend && npm test
```

## Structure frontend

```txt
frontend/src/
  app/          # router, store, guards
  config/       # politique CSP (report-uri)
  pages/        # écrans
  services/     # appels API
  components/   # UI réutilisable (Navbar)
  utils/        # validators, sanitizer, dom, images
```

## Sécurité

- Affichage des données API via `textContent` / `setSafeText`
- Validation formulaires (`validators.js`)
- CSRF : token session + en-tête `X-CSRF-Token`
- CSP : Report-Only (front) + politique API (back) + collecte `/csp-reports`
- `security.txt` exposé en statique
- Upload images filtré (type, taille) + stockage `/uploads`

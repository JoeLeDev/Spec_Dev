# Backend

API Node/Express + Prisma/SQLite. Écoute sur `http://localhost:5000`.

## Prérequis

- **Node.js** version 22 minimum (testé sur 22.22)
- **npm**

## Installation pas à pas

### 1. Cloner et entrer dans le dossier

```bash
git clone <url-du-repo>
cd Spec_Dev/backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Créer le fichier `.env`

Copier `.env.example` en `.env` :

```bash
# PowerShell
Copy-Item .env.example .env

# Bash / Linux / Mac
cp .env.example .env
```

Puis ouvrir `.env` et remplacer la valeur de `SESSION_SECRET` par un secret.

### 4. Créer la base SQLite et appliquer les migrations

```bash
npx prisma migrate dev
```

Inspecter la base avec :

```bash
npx prisma studio
```

### 5. Lancer le serveur en dev

```bash
npm run dev
```

## Lancer les tests

### Première utilisation : créer la base de test

```bash
# PowerShell
$env:DATABASE_URL="file:./test.db"; npx prisma migrate deploy

# Bash / Linux / Mac
DATABASE_URL="file:./test.db" npx prisma migrate deploy
```

### Lancer la suite de tests

```bash
npm test
```

15 tests Jest sur l'authentification (validation NIST, register, login, logout, /me, sessions). Les tests utilisent `test.db` et ne touchent jamais à `dev.db`.

## Endpoints

### Publics

| Méthode | URL | Description |
|---|---|---|
| GET | `/products` | Liste les produits. `?search=libellé` pour filtrer |
| GET | `/products/:id` | Détail d'un produit |
| GET | `/stats` | Nombre de produits par catégorie (CORS ouvert à toutes les IP) |
| POST | `/auth/register` | Inscription. Body : `{ email, password }`. Politique NIST 800-63b |
| POST | `/auth/login` | Connexion. Pose le cookie de session |
| GET | `/csrf-token` | Fournit le token CSRF à mettre dans l'en-tête `x-csrf-token` des mutations |

### Connecté (cookie de session requis)

| Méthode | URL | Description |
|---|---|---|
| GET | `/auth/me` | Renvoie l'utilisateur connecté |
| POST | `/auth/logout` | Détruit la session |

### Protégés (cookie de session + en-tête `x-csrf-token` requis)

| Méthode | URL | Description |
|---|---|---|
| POST | `/products` | Crée un produit |
| PUT | `/products/:id` | Modifie un produit |
| DELETE | `/products/:id` | Supprime un produit |
| POST | `/products/:id/images` | Upload sécurisé d'une image |

## Sécurité en place

- **Mots de passe** : hash bcrypt (coût 12), politique NIST 800-63b (longueur + blocklist breach corpus / dictionnaire / nom du service)
- **Sessions** : cookie `httpOnly` + `sameSite: 'lax'`, secret depuis `.env`
- **CSRF** : token UUID stocké en session, vérifié dans l'en-tête `x-csrf-token` sur les mutations
- **CORS** : restreint à `http://localhost:3000`, exception ouverte sur `/stats` (exigence du sujet)
- **XSS** : validation des entrées via Zod, aucune réinjection en HTML côté back (réponses JSON uniquement)
- **Anti-énumération** : `POST /auth/login` renvoie le même message pour « mauvais mdp » et « email inconnu »

## Stack

- Express 5, `cors`, `express-session`, `zod`, `bcrypt`
- Prisma 6 + SQLite (fichiers `prisma/dev.db` et `prisma/test.db`, ignorés par git)
- Jest + supertest pour les tests

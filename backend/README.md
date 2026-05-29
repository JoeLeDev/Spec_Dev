# Backend

API Node/Express + Prisma/SQLite, écoute sur `http://localhost:5000`.

## Installation

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Édite `.env` pour définir un `SESSION_SECRET` unique.

## Endpoints

- `GET /products`, `GET /products/:id`, `GET /stats` — publics
- `POST /auth/register`, `POST /auth/login` — publics
- `GET /auth/me`, `POST /auth/logout` — connecté (cookie de session)
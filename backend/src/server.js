import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import session from 'express-session';
import { csrfToken } from './middleware/csrf.js';
import { apiCspHeaders } from './middleware/cspHeaders.js';
import { UPLOADS_DIR, ensureUploadsDir } from './utils/productImageUpload.js';
import authRouter from './auth/auth.js';
import productsRouter from './products/products.js';
import statsRouter from './stats/stats.js';
import cspReportsRouter from './csp/cspReports.js';

ensureUploadsDir();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS front (auth + produits) : origine Vite sur le port 5173.
const corsFront = cors({
  origin: 'http://localhost:5173',
  credentials: true,
});

// CORS stats : accessible depuis n'importe quelle origine (reflete l'Origin entrant).
const corsOuvert = cors({
  origin: true,
  credentials: true,
});

app.use(express.json());
app.use(apiCspHeaders);
app.use('/uploads', express.static(UPLOADS_DIR));

//session (merci pour l'exemple du cours lol)
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // passer httpOnly à true rend le cookie invisible pour le JavaScript
      httpOnly: true,
      //protection contre CSRF, bien expliqué sur https://contentsquare.com/fr-fr/blog/samesite-cookie-attribute/ et doc express session
      //ça a l'air pas mal
      sameSite: 'lax',
      // passer secure à true rend le cookie fonctionnel uniquement en HTTPS mets la on est en dev HTTP
      secure: false,
    },
}));

app.use(csrfToken);

app.get('/', (req, res) => {
  res.send('Coucou');
})

//cors ouvert
app.use('/stats', corsOuvert, statsRouter);

// cors restreint (app.use pour que OPTIONS / preflight soit aussi couvert)
app.use('/auth', corsFront, authRouter);
app.use('/products', corsFront, productsRouter);
app.use('/csrf-token', corsFront);
app.get('/csrf-token', (req, res) => res.json({ csrfToken: req.session.csrfToken }));

app.use('/csp-reports', corsFront, cspReportsRouter);
app.use('/csp/reports', corsFront, cspReportsRouter);

//middleware d'erreur global (celui d'Express)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Erreur serveur');
});

if (process.env.NODE_ENV !== 'test'){
  app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
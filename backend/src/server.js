import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import productsRouter from './products.js';
import statsRouter from './stats.js';

const app = express();
const PORT = process.env.PORT || 5000;

//cors commun aux routes métier
//n'autoriser que le front à faire des requêtes et credentials pour les cookies de session à venir.
const corsFront = cors({
    origin: 'http://localhost:3000',
    credentials : true,
});

//cors dédié à /stats qui doit être ouvert à toutes les IP
const corsOuvert = cors({ origin: '*' });

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Coucou');
})

//cors ouvert
app.use('/stats', corsOuvert, statsRouter);

// cors restreint
app.use('/products', corsFront, productsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import productsRouter from './products.js';

const app = express();
const PORT = process.env.PORT || 5000;

//n'autoriser que le front à faire des requêtes et credentials pour les cookies de session à venir.
app.use(cors({
    origin: 'http://localhost:3000',
    credentials : true,
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Coucou');
})
app.use('/products', productsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

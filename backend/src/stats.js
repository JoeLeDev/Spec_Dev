import express from 'express';
import prisma from './prisma.js';

const router = express.Router();

//GET /stats
//nbr de produits par catégorie.
const statsParCat = async (req, res) => {
    //par categorie, compte chaque produit
    const stats = await prisma.product.groupBy({
        by: ['categorie'],
        _count: { _all: true },
    });

    //je reçois {cat: 'nom', _count: {_all:2}} etc donc je reformate en ce qui est demandé.
    const response = stats.map(({ categorie, _count }) => ({
        nom: categorie,
        compte: _count._all,
    }));

    res.json(response);
};

// -- Routes -------
router.get('/', statsParCat);

export default router;
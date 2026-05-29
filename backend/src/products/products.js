import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// GET /products
// récupérer tous les produits
// GET /products?search=
// avec filtre optionnel pour pouvoir rechercher.
const listerProduits = async (req, res) => {
    const { search } = req.query;

    //si ?search= est passé je filtre par libellé sinon je prends toute la liste.
    const filtre = search ? { libelle: { contains: search } } : {};

    const produits = await prisma.product.findMany({
        where: filtre,
        include: { images: true },
        orderBy: { createdAt: 'desc' },
    });

    res.json(produits);
};

// GET /products/:id
// récupérer un seul produit par son id.
const produitParId = async (req, res) => {
    const { id } = req.params;

    const produit = await prisma.product.findUnique({
        where: { id },
        include: { images: true },
    });

    //produit pas trouvable
    if (!produit) return res.status(404).json({ erreur: 'Produit introuvable' });

    res.json(produit);
};

// -- Routes -----------------
router.get('/', listerProduits);
router.get('/:id', produitParId);

export default router;
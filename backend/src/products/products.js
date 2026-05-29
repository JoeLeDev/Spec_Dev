import express from 'express';
import prisma from '../prisma.js';
import { uploadProductImage } from '../middleware/uploadProductImage.js';
import { verifyCsrfToken } from '../middleware/csrf.js';

const router = express.Router();

// Lie une image uploadée au produit (remplace les anciennes si besoin).
const attachImageToProduct = async (productId, file, { replaceExisting = false } = {}) => {
    if (!file) return;

    const url = `/uploads/${file.filename}`;

    if (replaceExisting) {
        await prisma.image.deleteMany({ where: { productId } });
    }

    await prisma.image.create({
        data: { url, productId },
    });
};

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

// POST /products
// créer un nouveau produit
const createProduit = async (req, res) => {
    const { libelle, description, prix, categorie } = req.body;
    const produit = await prisma.product.create({
        data: {
            libelle,
            description,
            prix: Number(prix),
            categorie,
        },
    });
    if (!produit) return res.status(400).json({ erreur: 'Erreur lors de la création du produit' });

    try {
        await attachImageToProduct(produit.id, req.file);
    } catch (error) {
        return res.status(400).json({ erreur: error.message || 'Image invalide' });
    }

    const produitAvecImages = await prisma.product.findUnique({
        where: { id: produit.id },
        include: { images: true },
    });

    res.json(produitAvecImages);
};

// PUT /products/:id
// mettre à jour un produit existant
const updateProduit = async (req, res) => {
    const { id } = req.params;
    const { libelle, description, prix, categorie } = req.body;
    const produit = await prisma.product.update({
        where: { id },
        data: {
            libelle,
            description,
            prix: Number(prix),
            categorie,
        },
    });
    if (!produit) return res.status(400).json({ erreur: 'Erreur lors de la mise à jour du produit' });

    try {
        await attachImageToProduct(produit.id, req.file, { replaceExisting: Boolean(req.file) });
    } catch (error) {
        return res.status(400).json({ erreur: error.message || 'Image invalide' });
    }

    const produitAvecImages = await prisma.product.findUnique({
        where: { id: produit.id },
        include: { images: true },
    });

    res.json(produitAvecImages);
};

// DELETE /products/:id
// supprimer un produit existant
const deleteProduit = async (req, res) => {
    const { id } = req.params;
    const produit = await prisma.product.delete({ where: { id } });
    if (!produit) return res.status(400).json({ erreur: 'Erreur lors de la suppression du produit' });
    res.json({ message: 'Produit supprimé avec succès' });
};


// -- Routes -----------------
router.get('/', listerProduits);
router.get('/:id', produitParId);
const withImageUpload = (handler) => (req, res, next) => {
    uploadProductImage(req, res, (err) => {
        if (err) {
            return res.status(400).json({ erreur: err.message || 'Upload image invalide' });
        }
        return handler(req, res, next);
    });
};

router.post('/', verifyCsrfToken, withImageUpload(createProduit));
router.put('/:id', verifyCsrfToken, withImageUpload(updateProduit));
router.delete('/:id', verifyCsrfToken, deleteProduit);

export default router;
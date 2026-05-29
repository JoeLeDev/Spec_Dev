import express from 'express';
import prisma from '../prisma.js';
import {
    uploadProductImage,
    MAX_PRODUCT_IMAGES,
} from '../middleware/uploadProductImage.js';
import { verifyCsrfToken } from '../middleware/csrf.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Lie une ou plusieurs images uploadées au produit (ajout ou remplacement).
const attachImagesToProduct = async (productId, files, { replaceExisting = false } = {}) => {
    const uploadedFiles = Array.isArray(files) ? files.filter(Boolean) : [];
    if (!uploadedFiles.length) return;

    if (replaceExisting) {
        await prisma.image.deleteMany({ where: { productId } });
    } else {
        const existingCount = await prisma.image.count({ where: { productId } });
        if (existingCount + uploadedFiles.length > MAX_PRODUCT_IMAGES) {
            throw new Error(`Maximum ${MAX_PRODUCT_IMAGES} images par produit`);
        }
    }

    await prisma.image.createMany({
        data: uploadedFiles.map((file) => ({
            url: `/uploads/${file.filename}`,
            productId,
        })),
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
        await attachImagesToProduct(produit.id, req.files);
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
        await attachImagesToProduct(produit.id, req.files);
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

router.post('/', requireAuth, verifyCsrfToken, withImageUpload(createProduit));
router.put('/:id', requireAuth, verifyCsrfToken, withImageUpload(updateProduit));
router.delete('/:id', requireAuth, verifyCsrfToken, deleteProduit);

export default router;
import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma.js';
import { validate } from '../middleware/validate.js';
import { RegisterSchema } from './auth.schema.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

//politique NIST : blocklist conforme = breach corpus + dictionnaire + nom du service
const mdpInterdits = new Set([
    'password', '12345678', 'qwerty12', 'azerty12', '11111111', 'motdepasse', 'soleil123', 
    'spec_dev',
]);

// POST auth/register
const inscrire = async (req, res) => {
    const { email, password } = req.body;

    if (mdpInterdits.has(password.toLowerCase())) {
        return res.status(400).json({ erreur: 'mdp trop courant' });
    }

    const existant = await prisma.user.findUnique({ where: { email } });
    if(existant) return res.status(409).json({ erreur: 'email déjà utilisé' });

    const passwordHash = await bcrypt.hash(password, 12);

    const utilisateur = await prisma.user.create({
        data: { email, passwordHash },
        select: { id: true, email: true },
    });

    res.status(201).json(utilisateur);
};

// POST auth/login
const connecter = async (req, res) => {
    //pas la peine de faire un schema zod pour ça à mon sens
    const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase().trim() : '';

    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ erreur: 'email et mdp requis' });

    const utilisateur = await prisma.user.findUnique({ where: { email } });
    if (!utilisateur) return res.status(401).json({ erreur: 'Identifiants invalides' });

    const mdpOk = await bcrypt.compare(password, utilisateur.passwordHash);
    if (!mdpOk) return res.status(401).json({ erreur: 'Identifiants invalides' });

    req.session.user = { id: utilisateur.id, email: utilisateur.email };

    res.json({ id: utilisateur.id, email: utilisateur.email });
};

//POST auth/logout
const deconnecter = (req, res) => {
    req.session.destroy(() => res.status(204).end());
};

//GET auth/me
//pour vérifier l'identité (middleware requireAuth)
const moi = (req, res) => {
    res.json(req.session.user);
};

// -- routes --------
router.post('/register', validate(RegisterSchema), inscrire);
router.post('/login', connecter);
router.post('/logout', requireAuth, deconnecter);
router.get('/me', requireAuth, moi);

export default router;
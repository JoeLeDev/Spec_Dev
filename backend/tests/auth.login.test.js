import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/server.js';
import prisma from '../src/prisma.js';

//tests d'intégration de POST /auth/login contre la bdd de test
describe('POST /auth/login', () => {
    let hashValide;

    // bcrypt.hash est lent — on le fait UNE SEULE FOIS et on réutilise dans chaque test
    beforeAll(async () => {
        hashValide = await bcrypt.hash('motdepasselong', 12);
    });

    // Avant chaque test : table users propre + Bob fraîchement créée avec son hash
    beforeEach(async () => {
        await prisma.user.deleteMany();
        await prisma.user.create({
            data: { email: 'bob@test.fr', passwordHash: hashValide },
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('identifiants valides → 200 + id/email + cookie de session', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'bob@test.fr', password: 'motdepasselong' });

        expect(response.status).toBe(200);
        expect(response.body.email).toBe('bob@test.fr');
        // Vérifie que le serveur a bien posé un Set-Cookie
        expect(response.headers['set-cookie']).toBeDefined();
    });

    test('mauvais mot de passe → 401 "Identifiants invalides"', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'bob@test.fr', password: 'mauvais-mdp' });

        expect(response.status).toBe(401);
        expect(response.body.erreur).toBe('Identifiants invalides');
    });

    test('email inconnu → 401 (même message qu\'un mauvais mdp — anti-énumération)', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'inconnu@x.fr', password: 'motdepasselong' });

        expect(response.status).toBe(401);
        expect(response.body.erreur).toBe('Identifiants invalides');
    });

    test('body incomplet (pas de mdp) → 400', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ email: 'bob@test.fr' });

        expect(response.status).toBe(400);
        expect(response.body.erreur).toBe('email et mdp requis');
    });
});

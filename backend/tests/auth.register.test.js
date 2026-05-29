import request from 'supertest';
import app from '../src/server.js';
import prisma from '../src/prisma.js';

// tests d'intégration de POST auth/register contre la bdd de test.
// Au début j'ai essayé de mocker mais j'avais que des pb donc j'ai fait avec une bdd de tests
describe('POST /auth/register', () => {
    // Avant chaque test : on nettoie la table users de la base de test
    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    // À la fin de tous les tests : on coupe proprement la connexion Prisma
    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('email libre + mdp valide → 201 + utilisateur sans hash', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({ email: 'alice@test.fr', password: 'motdepasselong' });

        expect(response.status).toBe(201);
        expect(response.body.email).toBe('alice@test.fr');
        expect(response.body.id).toBeDefined();
        expect(response.body.passwordHash).toBeUndefined();
    });

    test('email déjà pris → 409', async () => {
        // On crée l'utilisateur en base avant de tester la duplication
        await prisma.user.create({
            data: { email: 'alice@test.fr', passwordHash: 'fake-hash' },
        });

        const response = await request(app)
            .post('/auth/register')
            .send({ email: 'alice@test.fr', password: 'motdepasselong' });

        expect(response.status).toBe(409);
        expect(response.body.erreur).toBe('email déjà utilisé');
    });
});

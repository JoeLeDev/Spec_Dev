import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/server.js';
import prisma from '../src/prisma.js';

// tests des routes connectées
// utilise request.agent pour garder le cookie de session entre les requêtes comme un navigateur virtuel.
describe('Routes avec session active', () => {
    let hashValide;
    let agent;

    beforeAll(async () => {
        hashValide = await bcrypt.hash('motdepasselong', 12);
    });

    beforeEach(async () => {
        // Repart d'une base propre + Bob inscrit
        await prisma.user.deleteMany();
        await prisma.user.create({
            data: { email: 'bob@test.fr', passwordHash: hashValide },
        });

        // Le "navigateur virtuel" qui garde les cookies entre requêtes
        agent = request.agent(app);
        // On le connecte une fois → cookie posé pour les tests suivants
        await agent.post('/auth/login').send({ email: 'bob@test.fr', password: 'motdepasselong' });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('GET /auth/me avec session → 200 + email connecté', async () => {
        const response = await agent.get('/auth/me');

        expect(response.status).toBe(200);
        expect(response.body.email).toBe('bob@test.fr');
        expect(response.body.id).toBeDefined();
    });

    test('POST /auth/logout avec session → 204', async () => {
        const response = await agent.post('/auth/logout');

        expect(response.status).toBe(204);
    });

    test('Après logout, GET /auth/me renvoie 401', async () => {
        // Premier appel : on se déconnecte
        await agent.post('/auth/logout');
        // Deuxième appel : la session a été détruite côté serveur
        const response = await agent.get('/auth/me');

        expect(response.status).toBe(401);
        expect(response.body.erreur).toBe('Non connecté');
    });
});

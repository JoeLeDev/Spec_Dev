import request from 'supertest';
import app from '../src/server.js';

//tests des routes qui touchent pas la bdd (validation Zod, blocklist NIST, requireAuth)
describe('Routes protégées sans session', () => {
    test('GET /auth/me renvoie 401 si non connecté', async () => {
        const response = await request(app).get('/auth/me');

        expect(response.status).toBe(401);
        expect(response.body.erreur).toBe('Non connecté');
    });

    test('POST /auth/logout renvoie 401 si non connecté', async () => {
        const response = await request(app).post('/auth/logout');

        expect(response.status).toBe(401);
        expect(response.body.erreur).toBe('Non connecté');
    });
});

describe('POST /auth/register — validation', () => {
    test('sans body → 400 + détails Zod', async () => {
        const response = await request(app).post('/auth/register').send({});

        expect(response.status).toBe(400);
        expect(response.body.erreur).toBe('Données invalides');
        expect(response.body.details).toBeDefined();
    });

    test('mot de passe trop court → 400 + message NIST', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({ email: 'test@x.fr', password: 'court' });

        expect(response.status).toBe(400);
        expect(response.body.details).toEqual(
            expect.arrayContaining([expect.stringContaining('8 caractères')])
        );
    });

    test('mot de passe trop courant (NIST blocklist) → 400', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({ email: 'test@x.fr', password: 'motdepasse' });

        expect(response.status).toBe(400);
        expect(response.body.erreur).toBe('mdp trop courant');
    });

    test('email manquant → 400 + détails Zod', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({ password: 'motdepasselong' });

        expect(response.status).toBe(400);
        expect(response.body.details).toEqual(
            expect.arrayContaining([expect.stringContaining('email')])
        );
    });
});

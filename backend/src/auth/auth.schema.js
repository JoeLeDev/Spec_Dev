import { z } from 'zod';

//Schéma zod de validation pour les payloads de la route register
//Mdp min 8 char pour suivre NIST
//Max 72 char car NIST recommande d'avoir une limite quand même, j'ai pris le max de bcrypt avant d'être tronqué.
export const RegisterSchema = z.object({
    email: z.string().min(1, 'Email requis').transform((s) => s.toLowerCase().trim()),
    password: z.string()
        .min(8, 'mdp doit faire au moins 8 caractères')
        .max(72, 'mdp ne peut pas dépasser 72 caractères'),
});

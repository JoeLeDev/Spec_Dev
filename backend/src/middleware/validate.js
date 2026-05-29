// Middleware Zod
// valide req.body et le remplace par version normalisée, ou rep 400
//syntaxe un peu diff de celle vu y a 2-3 mois mais vient de la doc https://zod.dev/basics, a l'air + moderne ?
export const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const details = result.error.issues.map((e) => `${e.path.join('.')} : ${e.message}`);
        return res.status(400).json({ erreur: 'Données invalides', details });
    }
    req.body = result.data;
    next();
};

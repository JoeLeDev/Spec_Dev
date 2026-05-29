//middleware qui laisse passer si l'utilisateur est connecté, sinon 401
export const requireAuth = (req, res, next) => {
    if (!req.session.user) return res.status(401).json({ erreur: "Non connecté" });
    next();
};
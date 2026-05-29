//Token unique stocké en session, qu'on pourra exiger en en-tête 
//j'ai adapté la syntaxe du cours pour de l'api : https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#employing-custom-request-headers-for-ajaxapi
//le token est transporté via en-tête x-csrf-token plutôt que via body

//génère et expose le token en session
export const csrfToken = (req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomUUID();
    }
    next();
};

//vérifie que token envoyé par front est celui stocké en session
export const verifyCsrfToken = (req, res, next) => {
    if (req.headers['x-csrf-token'] !== req.session.csrfToken) {
        return res.status(403).json({ erreur: 'Token CSRF invalide' });
    }
    next();
};
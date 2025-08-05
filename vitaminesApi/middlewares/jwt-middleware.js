const jwt = require('jsonwebtoken');


function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1]; // Format: Bearer <token>

    if (!token) {
        return res.status(401).json({ error: 'Token invalide' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_PUBLIC.replace(/\\n/g, '\n'), { algorithms: ['RS256'] });
        req.user = decoded; // On stocke les infos du token dans req.user
        next(); // Token OK ➜ on continue vers la route suivante
    } catch (error) {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
}

module.exports = authMiddleware;

// À placer après authMiddleware : le rôle vient du token JWT (voir user-controller).
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }
    next();
}

module.exports = requireAdmin;

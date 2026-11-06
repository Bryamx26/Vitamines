// Limiteur de requêtes en mémoire (par IP), sans dépendance.
// Derrière un reverse proxy, définir TRUST_PROXY pour que req.ip soit l'IP du client.

function rateLimit({ windowMs, max, message }) {
    const hits = new Map(); // ip → { count, resetAt }

    // Nettoyage périodique des fenêtres expirées
    setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of hits) if (entry.resetAt <= now) hits.delete(ip);
    }, windowMs).unref();

    return (req, res, next) => {
        const now = Date.now();
        const ip = req.ip;
        let entry = hits.get(ip);
        if (!entry || entry.resetAt <= now) {
            entry = { count: 0, resetAt: now + windowMs };
            hits.set(ip, entry);
        }
        entry.count++;

        if (entry.count > max) {
            const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
            res.set('Retry-After', String(retryAfter));
            return res.status(429).json({ error: message, retryAfter });
        }
        next();
    };
}

module.exports = rateLimit;

// Cache mémoire des réponses GET, borné : au-delà de MAX_ENTRIES, les plus anciennes
// entrées sont retirées (une Map garde l'ordre d'insertion).
const MAX_ENTRIES = 500;
const cache = new Map();

function store(key, value) {
    cache.delete(key); // réinsertion en fin de Map = entrée la plus récente
    cache.set(key, value);
    while (cache.size > MAX_ENTRIES) {
        cache.delete(cache.keys().next().value);
    }
}

function cacheMiddleware(ttlInSeconds) {
    return (req, res, next) => {
        const key = req.originalUrl;

        if (req.method !== 'GET') {
            return next();
        }

        const cachedItem = cache.get(key);
        const now = Date.now();

        if (cachedItem && (now - cachedItem.timestamp) < ttlInSeconds * 1000) {
            console.log(`Cache HIT: ${key}`);
            res.status(cachedItem.statusCode);
            return res.json(cachedItem.data);
        }
        if (cachedItem) cache.delete(key); // expiré

        console.log(`Cache MISS: ${key}`);

        const originalJson = res.json.bind(res);
        res.json = (body) => {
            // Seules les réponses réussies sont gardées
            if (res.statusCode < 400) {
                store(key, { data: body, statusCode: res.statusCode, timestamp: Date.now() });
            }
            return originalJson(body);
        };

        next();
    };
}

function invalidateCacheByKey(key) {
    if (cache.delete(key)) {
        console.log(`Cache invalidé pour : ${key}`);
    } else {
        console.log(`Aucun cache à invalider pour : ${key}`);
    }
}

function clearAllCache() {
    if (cache.size > 0) {
        cache.clear();
        console.log("Cache vidé entièrement");
    } else {
        console.log("Le cache est déjà vide");
    }
}

module.exports = { cacheMiddleware, invalidateCacheByKey, clearAllCache, MAX_ENTRIES };

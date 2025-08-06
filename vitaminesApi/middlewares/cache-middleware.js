const cache = {};

function cacheMiddleware(ttlInSeconds) {
    return (req, res, next) => {
        const key = req.originalUrl;

        if (req.method !== 'GET') {
            return next();
        }

        const cachedItem = cache[key];
        const now = Date.now();

        if (cachedItem && (now - cachedItem.timestamp) < ttlInSeconds * 1000) {
            console.log(`Cache HIT: ${key}`);
            res.status(cachedItem.statusCode);
            return res.json(cachedItem.data);
        }

        console.log(`Cache MISS: ${key}`);

        const originalJson = res.json.bind(res);
        res.json = (body) => {
            cache[key] = {
                data: body,
                statusCode: res.statusCode,
                timestamp: Date.now()
            };
            console.log(`Réponse mise en cache: ${key} avec status ${res.statusCode}`);
            return originalJson(body);
        };

        next();
    };
}

function invalidateCacheByKey(key) {
    if (cache[key]) {
        delete cache[key];
        console.log(`Cache invalidé pour : ${key}`);
    } else {
        console.log(`Aucun cache à invalider pour : ${key}`);
    }
}

function clearAllCache() {
    const cacheKeys = Object.keys(cache);
    if (cacheKeys.length > 0) {
        cacheKeys.forEach(key => delete cache[key]);
        console.log("Cache vidé entièrement");
    } else {
        console.log("Le cache est déjà vide");
    }
}

module.exports = { cacheMiddleware, invalidateCacheByKey, clearAllCache };

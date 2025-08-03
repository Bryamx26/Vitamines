const cache = {};

function cacheMiddleware(ttlInSeconds) {
    return (req, res, next) => {
        const key = req.originalUrl;

        // Ne pas utiliser le cache pour POST/PUT/DELETE
        if (req.method !== 'GET') {
            return next();
        }

        const cachedItem = cache[key];
        const now = Date.now();

        if (cachedItem && (now - cachedItem.timestamp) < ttlInSeconds * 1000) {
            console.log(`Cache HIT: ${key}`);
            return res.json(cachedItem.data);
        }

        console.log(`Cache MISS: ${key}`);

        // Intercepter la réponse pour la mettre en cache
        const originalJson = res.json;
        res.json = (body) => {
            cache[key] = {
                data: body,
                timestamp: Date.now()
            };
            originalJson.call(res, body);
        };

        next();
    };
}

function invalidateCacheByKey(key) {
    if (cache[key]) {
        delete cache[key];
        console.log("Cache invalidé pour :", key);
    }
}

function clearAllCache() {
    Object.keys(cache).forEach(key => delete cache[key]);
    console.log("Cache vidé entièrement");
}

module.exports = { cacheMiddleware, invalidateCacheByKey, clearAllCache };

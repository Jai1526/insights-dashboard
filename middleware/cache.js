const cache = new Map();

export const cacheMiddleware = (durationInSeconds = 60) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create a unique cache key based on URL, query params, and user ID (to keep cache user-specific if needed)
    const userId = req.user ? req.user._id.toString() : 'anonymous';
    const key = `${userId}-${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      const { expiresAt, data } = cachedResponse;
      if (Date.now() < expiresAt) {
        return res.status(200).json(data);
      }
      // Cache expired, delete it
      cache.delete(key);
    }

    // Override res.json to intercept and cache the response
    const originalJson = res.json;
    res.json = function (body) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cache.set(key, {
          expiresAt: Date.now() + durationInSeconds * 1000,
          data: body,
        });
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

// Helper to clear cache when data changes (e.g., on new events or user updates)
export const clearCache = () => {
  cache.clear();
};

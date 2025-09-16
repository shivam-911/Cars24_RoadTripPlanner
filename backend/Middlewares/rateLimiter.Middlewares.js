const rateLimitMap = new Map();

const rateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        if (!rateLimitMap.has(clientId)) {
            rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
            return next();
        }

        const clientData = rateLimitMap.get(clientId);

        if (now > clientData.resetTime) {
            // Reset the counter
            clientData.count = 1;
            clientData.resetTime = now + windowMs;
            return next();
        }

        if (clientData.count >= max) {
            return res.status(429).json({
                message: 'Too many requests, please try again later.',
                retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
            });
        }

        clientData.count++;
        next();
    };
};

module.exports = rateLimiter;

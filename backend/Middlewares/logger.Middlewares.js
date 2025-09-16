const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.connection.remoteAddress || '';

    // Log to console
    console.log(`[${timestamp}] ${method} ${url} - ${ip}`);

    // Log to file (optional - for production)
    if (process.env.NODE_ENV === 'production') {
        const logEntry = `[${timestamp}] ${method} ${url} - ${ip} - ${userAgent}\n`;
        const logFile = path.join(logsDir, `access-${new Date().toISOString().split('T')[0]}.log`);

        fs.appendFile(logFile, logEntry, (err) => {
            if (err) console.error('Error writing to log file:', err);
        });
    }

    // Log response
    const originalSend = res.send;
    res.send = function(data) {
        const responseTime = Date.now() - req.startTime;
        console.log(`[${timestamp}] ${method} ${url} - ${res.statusCode} - ${responseTime}ms`);
        originalSend.call(this, data);
    };

    req.startTime = Date.now();
    next();
};

module.exports = logger;

const ApiLog = require('../models/ApiLog');

const apiLogger = async (req, res, next) => {
    // Capture the original send to intercept the status code before it finishes
    const originalSend = res.send;
    
    res.send = function(body) {
        // Run original send
        originalSend.call(this, body);

        // Don't log static file fetching extensively or dashboard assets
        if (req.originalUrl.startsWith('/uploads')) return;
        
        // Asynchronously save to db without blocking the response
        setTimeout(async () => {
            try {
                await new ApiLog({
                    endpoint: req.originalUrl,
                    method: req.method,
                    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                    user: req.user ? req.user.email : 'Anonymous',
                    statusCode: res.statusCode,
                    projectId: req.projectId || null // Optional, if a route sets req.projectId
                }).save();
            } catch (err) {
                console.error('Failed to write API Log:', err.message);
            }
        }, 0);
    };
    
    next();
};

module.exports = apiLogger;

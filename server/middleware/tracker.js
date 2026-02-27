const DailyStats = require('../models/DailyStats');

const tracker = async (req, res, next) => {
    // Skip static files or OPTIONS requests if desired, but for now we track everything api related
    if (req.method === 'OPTIONS') return next();

    res.on('finish', async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            await DailyStats.findOneAndUpdate(
                { date: today },
                { $inc: { requests: 1 } },
                { upsert: true, returnDocument: 'after' }
            );
        } catch (err) {
            console.error('Failed to log request stats:', err);
        }
    });

    next();
};

module.exports = tracker;

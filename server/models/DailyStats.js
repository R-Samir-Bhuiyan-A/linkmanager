const mongoose = require('mongoose');

const DailyStatsSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true }, // Format: YYYY-MM-DD
    requests: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 } // Simple unique IP tracking could be added later
});

module.exports = mongoose.model('DailyStats', DailyStatsSchema);

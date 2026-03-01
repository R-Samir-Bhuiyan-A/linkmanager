const mongoose = require('mongoose');

const ApiLogSchema = new mongoose.Schema({
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    ip: { type: String, required: true },
    user: { type: String, default: 'Anonymous' },
    statusCode: { type: Number, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ApiLog', ApiLogSchema);

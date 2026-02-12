const mongoose = require('mongoose');

const InstanceSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    instanceId: { type: String, required: true, index: true }, // Client generated UUID
    hardwareId: { type: String }, // Optional, provided by client
    platform: { type: String }, // e.g., 'ios', 'android', 'web'
    version: { type: String, required: true },
    ip: { type: String },
    lastHeartbeat: { type: Date, default: Date.now, index: true },
    requestCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('Instance', InstanceSchema);

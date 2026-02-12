const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    maintenanceMode: { type: Boolean, default: false },
    publicId: { type: String, required: true, unique: true }, // For clients to identify project without DB ID
    secretKey: { type: String, required: true, select: false }, // For admin actions/updates if needed
    latestVersion: { type: String, default: '1.0.0' },
    minVersion: { type: String, default: '0.0.0' },
    updateUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);

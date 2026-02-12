const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: String, default: 'other' }, // web, android app, desktop app, plugin, etc.
    description: { type: String, default: '' }, // Markdown content
    links: [{
        title: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String, default: 'link' } // globe, github, trello, etc.
    }],
    maintenanceMode: { type: Boolean, default: false },
    publicId: { type: String, required: true, unique: true }, // For clients to identify project without DB ID
    secretKey: { type: String, required: true, select: false }, // For admin actions/updates if needed
    latestVersion: { type: String, default: '1.0.0' },
    minVersion: { type: String, default: '0.0.0' },
    updateUrl: { type: String },
    clientAuth: {
        enabled: { type: Boolean, default: false },
        publicFields: [{ type: String }] // e.g. ['latestVersion', 'updateUrl']
    },
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['Viewer', 'Editor', 'Admin'], default: 'Viewer' }
    }],
    apiKeys: [{
        name: { type: String, required: true, trim: true },
        key: { type: String, required: true }, // The secret string (e.g., "sk_...")
        scopes: [{ type: String, enum: ['read', 'write', 'admin'], default: 'read' }],
        lastUsed: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);

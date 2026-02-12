const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    user: { type: String, required: true },
    action: { type: String, required: true },
    target: { type: String, required: true },
    details: { type: Object },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    createdAt: { type: Date, default: Date.now },
    iconType: { type: String, default: 'info' } // info, warning, danger, success
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
